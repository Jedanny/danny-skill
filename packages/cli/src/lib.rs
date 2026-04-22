use napi::bindgen_prelude::*;
use napi_derive::napi;
use std::fs;
use std::path::{Path, PathBuf};

const DEFAULT_PATTERNS_TEMPLATE: &str = include_str!("../templates/PATTERNS.md");

#[napi(object)]
pub struct ValidationResult {
    pub ok: bool,
    pub skill_count: u32,
    pub error_count: u32,
    pub errors: Vec<String>,
    pub errors_by_category: Vec<ValidationErrorGroup>,
}

#[napi(object)]
pub struct PackagePlanEntry {
    pub skill_name: String,
    pub relative_path: String,
}

#[napi(object)]
pub struct ValidationErrorGroup {
    pub category: String,
    pub errors: Vec<String>,
}

struct MarkdownContract {
    path: String,
    must_contain: Vec<String>,
}

struct ValidationSpec {
    required_files: Vec<String>,
    json_files: Vec<String>,
    markdown_contracts: Vec<MarkdownContract>,
}

fn push_validation_error(errors: &mut Vec<String>, skill_name: &str, category: &str, message: String) {
    errors.push(format!("{skill_name}: [{category}] {message}"));
}

fn group_validation_errors(errors: &[String]) -> Vec<ValidationErrorGroup> {
    let mut groups: Vec<ValidationErrorGroup> = Vec::new();

    for error in errors {
        let category = error
            .split_once(": [")
            .and_then(|(_, rest)| rest.split_once(']'))
            .map(|(category, _)| category.to_string())
            .unwrap_or_else(|| "unknown".to_string());

        if let Some(existing) = groups.iter_mut().find(|group| group.category == category) {
            existing.errors.push(error.clone());
        } else {
            groups.push(ValidationErrorGroup {
                category,
                errors: vec![error.clone()],
            });
        }
    }

    groups
}

#[napi]
pub fn validate_skills(root: String) -> Result<ValidationResult> {
    let skills_dir = Path::new(&root).join("skills");
    let packaged_validation = Path::new(&root)
        .file_name()
        .is_some_and(|name| name == "dist");
    let mut errors = Vec::new();
    let mut skill_count = 0;

    let entries = fs::read_dir(&skills_dir)
        .map_err(|err| Error::from_reason(format!("failed to read skills directory: {err}")))?;

    for entry in entries {
        let entry = entry
            .map_err(|err| Error::from_reason(format!("failed to read skill entry: {err}")))?;
        let file_type = entry
            .file_type()
            .map_err(|err| Error::from_reason(format!("failed to read skill entry type: {err}")))?;

        if !file_type.is_dir() {
            continue;
        }

        let skill_name = entry.file_name().to_string_lossy().to_string();
        let skill_path = entry.path().join("SKILL.md");
        skill_count += 1;

        let content = match fs::read_to_string(&skill_path) {
            Ok(content) => content,
            Err(_) => {
                push_validation_error(&mut errors, &skill_name, "structure", "missing SKILL.md".to_string());
                continue;
            }
        };

        if !content.contains(&format!("name: {skill_name}")) {
            push_validation_error(
                &mut errors,
                &skill_name,
                "frontmatter",
                "frontmatter name must match directory".to_string(),
            );
        }

        if !content.contains("description: Use when")
            && !content.contains("description: \"Use when")
        {
            push_validation_error(
                &mut errors,
                &skill_name,
                "frontmatter",
                "description must start with \"Use when\"".to_string(),
            );
        }

        let config_path = entry.path().join("config.yaml");
        if !config_path.exists() {
            continue;
        }

        let config_content = read_file(&config_path)?;
        let validation = parse_validation_spec(&config_content);

        for relative_path in validation.required_files {
            if !entry.path().join(&relative_path).exists() && !packaged_validation {
                push_validation_error(
                    &mut errors,
                    &skill_name,
                    "required_files",
                    format!("missing required file {relative_path}"),
                );
            }
        }

        for relative_path in validation.json_files {
            let json_path = entry.path().join(&relative_path);
            if !json_path.exists() {
                if !packaged_validation {
                    push_validation_error(
                        &mut errors,
                        &skill_name,
                        "json_files",
                        format!("missing json file {relative_path}"),
                    );
                }
                continue;
            }

            let json_content = match read_file(&json_path) {
                Ok(content) => content,
                Err(_) => {
                    push_validation_error(
                        &mut errors,
                        &skill_name,
                        "json_files",
                        format!("missing json file {relative_path}"),
                    );
                    continue;
                }
            };
            if !json_content_is_valid(&json_content) {
                push_validation_error(
                    &mut errors,
                    &skill_name,
                    "json_files",
                    format!("invalid json file {relative_path}"),
                );
            }
        }

        for contract in validation.markdown_contracts {
            let markdown_path = entry.path().join(&contract.path);
            if !markdown_path.exists() {
                if !packaged_validation {
                    push_validation_error(
                        &mut errors,
                        &skill_name,
                        "markdown_contracts",
                        format!("missing markdown contract file {}", contract.path),
                    );
                }
                continue;
            }

            let markdown_content = match read_file(&markdown_path) {
                Ok(content) => content,
                Err(_) => {
                    push_validation_error(
                        &mut errors,
                        &skill_name,
                        "markdown_contracts",
                        format!("missing markdown contract file {}", contract.path),
                    );
                    continue;
                }
            };
            for needle in contract.must_contain {
                if !markdown_content.contains(&needle) {
                    push_validation_error(
                        &mut errors,
                        &skill_name,
                        "markdown_contracts",
                        format!("markdown contract {} missing \"{}\"", contract.path, needle),
                    );
                }
            }
        }
    }

    Ok(ValidationResult {
        ok: errors.is_empty(),
        skill_count,
        error_count: errors.len() as u32,
        errors_by_category: group_validation_errors(&errors),
        errors,
    })
}

fn json_escape(value: &str) -> String {
    value.replace('\\', "\\\\").replace('"', "\\\"")
}

#[napi]
pub fn write_config_paths(root: String, project_path: String, global_path: String) -> Result<String> {
    let config_dir = Path::new(&root).join(".danny");
    fs::create_dir_all(&config_dir)
        .map_err(|err| Error::from_reason(format!("failed to create config directory: {err}")))?;

    let config_path = config_dir.join("config.json");
    let content = format!(
        "{{\n  \"knowledge_base\": {{\n    \"project\": \"{}\",\n    \"global\": \"{}\"\n  }}\n}}\n",
        json_escape(&project_path),
        json_escape(&global_path)
    );
    fs::write(&config_path, content)
        .map_err(|err| Error::from_reason(format!("failed to write config file: {err}")))?;

    Ok(config_path.to_string_lossy().to_string())
}

#[napi]
pub fn init_project_knowledge(root: String, project_path: String) -> Result<String> {
    let base_path = Path::new(&root).join(project_path);
    let directories = [
        "inbox/inspiration",
        "ideas",
        "research",
        "experiments/autoresearch",
        "learnings/errors",
        "learnings/corrections",
        "learnings/successes",
        "learnings/patterns",
        "distilled/concepts",
        "distilled/best-practices",
        "distilled/decisions",
        "distilled/lessons",
    ];

    for directory in directories {
        fs::create_dir_all(base_path.join(directory)).map_err(|err| {
            Error::from_reason(format!("failed to create knowledge directory: {err}"))
        })?;
    }

    let patterns_path = base_path.join("learnings").join("patterns").join("PATTERNS.md");
    if !patterns_path.exists() {
        fs::write(&patterns_path, DEFAULT_PATTERNS_TEMPLATE)
        .map_err(|err| Error::from_reason(format!("failed to write patterns index: {err}")))?;
    }

    Ok(base_path.to_string_lossy().to_string())
}

fn read_file(path: &Path) -> Result<String> {
    fs::read_to_string(path)
        .map_err(|err| Error::from_reason(format!("failed to read {}: {err}", path.display())))
}

fn write_file(path: &Path, content: &str) -> Result<()> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|err| Error::from_reason(format!("failed to create {}: {err}", parent.display())))?;
    }
    fs::write(path, content)
        .map_err(|err| Error::from_reason(format!("failed to write {}: {err}", path.display())))
}

fn trim_yaml_scalar(value: &str) -> String {
    value.trim().trim_matches('"').trim_matches('\'').to_string()
}

fn parse_validation_spec(content: &str) -> ValidationSpec {
    let mut in_validation = false;
    let mut active_section = String::new();
    let mut current_contract: Option<usize> = None;
    let mut in_must_contain = false;
    let mut spec = ValidationSpec {
        required_files: Vec::new(),
        json_files: Vec::new(),
        markdown_contracts: Vec::new(),
    };

    for line in content.lines() {
        if !in_validation {
            if line == "validation:" {
                in_validation = true;
            }
            continue;
        }

        if line.chars().next().is_some_and(|ch| !ch.is_whitespace()) {
            break;
        }

        if let Some(section_name) = line
            .strip_prefix("  ")
            .and_then(|value| value.strip_suffix(':'))
        {
            if !section_name.contains(' ') {
                active_section = section_name.to_string();
                current_contract = None;
                in_must_contain = false;
                continue;
            }
        }

        match active_section.as_str() {
            "required_files" | "json_files" => {
                if let Some(list_value) = line.strip_prefix("    - ") {
                    let trimmed = trim_yaml_scalar(list_value);
                    if active_section == "required_files" {
                        spec.required_files.push(trimmed);
                    } else {
                        spec.json_files.push(trimmed);
                    }
                }
            }
            "markdown_contracts" => {
                if let Some(path_value) = line.strip_prefix("    - path: ") {
                    spec.markdown_contracts.push(MarkdownContract {
                        path: trim_yaml_scalar(path_value),
                        must_contain: Vec::new(),
                    });
                    current_contract = spec.markdown_contracts.len().checked_sub(1);
                    in_must_contain = false;
                    continue;
                }

                if line == "      must_contain:" {
                    in_must_contain = true;
                    continue;
                }

                if in_must_contain {
                    if let Some(item_value) = line.strip_prefix("        - ") {
                        if let Some(index) = current_contract {
                            spec.markdown_contracts[index]
                                .must_contain
                                .push(trim_yaml_scalar(item_value));
                        }
                    }
                }
            }
            _ => {}
        }
    }

    spec
}

fn skip_json_whitespace(input: &str, mut index: usize) -> usize {
    while let Some(ch) = input[index..].chars().next() {
        if !ch.is_whitespace() {
            break;
        }
        index += ch.len_utf8();
    }
    index
}

fn parse_json_string(input: &str, start: usize) -> Option<usize> {
    let mut index = start;
    if input[index..].chars().next()? != '"' {
        return None;
    }
    index += 1;

    let mut escaped = false;
    while let Some(ch) = input[index..].chars().next() {
        index += ch.len_utf8();
        if escaped {
            escaped = false;
            continue;
        }
        match ch {
            '\\' => escaped = true,
            '"' => return Some(index),
            _ => {}
        }
    }

    None
}

fn parse_json_number(input: &str, start: usize) -> Option<usize> {
    let mut index = start;
    let bytes = input.as_bytes();

    if bytes.get(index) == Some(&b'-') {
        index += 1;
    }

    let mut digits = 0;
    while matches!(bytes.get(index), Some(b'0'..=b'9')) {
        index += 1;
        digits += 1;
    }
    if digits == 0 {
        return None;
    }

    if bytes.get(index) == Some(&b'.') {
        index += 1;
        let mut fraction_digits = 0;
        while matches!(bytes.get(index), Some(b'0'..=b'9')) {
            index += 1;
            fraction_digits += 1;
        }
        if fraction_digits == 0 {
            return None;
        }
    }

    if matches!(bytes.get(index), Some(b'e') | Some(b'E')) {
        index += 1;
        if matches!(bytes.get(index), Some(b'+') | Some(b'-')) {
            index += 1;
        }
        let mut exponent_digits = 0;
        while matches!(bytes.get(index), Some(b'0'..=b'9')) {
            index += 1;
            exponent_digits += 1;
        }
        if exponent_digits == 0 {
            return None;
        }
    }

    Some(index)
}

fn parse_json_literal(input: &str, start: usize, literal: &str) -> Option<usize> {
    input[start..]
        .strip_prefix(literal)
        .map(|_| start + literal.len())
}

fn parse_json_array(input: &str, start: usize) -> Option<usize> {
    let mut index = start + 1;
    index = skip_json_whitespace(input, index);
    if input[index..].chars().next()? == ']' {
        return Some(index + 1);
    }

    loop {
        index = parse_json_value(input, index)?;
        index = skip_json_whitespace(input, index);
        match input[index..].chars().next()? {
            ',' => {
                index += 1;
                index = skip_json_whitespace(input, index);
            }
            ']' => return Some(index + 1),
            _ => return None,
        }
    }
}

fn parse_json_object(input: &str, start: usize) -> Option<usize> {
    let mut index = start + 1;
    index = skip_json_whitespace(input, index);
    if input[index..].chars().next()? == '}' {
        return Some(index + 1);
    }

    loop {
        index = parse_json_string(input, index)?;
        index = skip_json_whitespace(input, index);
        if input[index..].chars().next()? != ':' {
            return None;
        }
        index += 1;
        index = skip_json_whitespace(input, index);
        index = parse_json_value(input, index)?;
        index = skip_json_whitespace(input, index);
        match input[index..].chars().next()? {
            ',' => {
                index += 1;
                index = skip_json_whitespace(input, index);
            }
            '}' => return Some(index + 1),
            _ => return None,
        }
    }
}

fn parse_json_value(input: &str, start: usize) -> Option<usize> {
    let index = skip_json_whitespace(input, start);
    match input[index..].chars().next()? {
        '"' => parse_json_string(input, index),
        '{' => parse_json_object(input, index),
        '[' => parse_json_array(input, index),
        't' => parse_json_literal(input, index, "true"),
        'f' => parse_json_literal(input, index, "false"),
        'n' => parse_json_literal(input, index, "null"),
        '-' | '0'..='9' => parse_json_number(input, index),
        _ => None,
    }
}

fn json_content_is_valid(input: &str) -> bool {
    let start = skip_json_whitespace(input, 0);
    let Some(end) = parse_json_value(input, start) else {
        return false;
    };
    skip_json_whitespace(input, end) == input.len()
}

fn parse_packaging_include_list(content: &str, profile: &str) -> Option<Vec<String>> {
    let mut in_packaging = false;
    let mut in_profile = false;
    let mut in_include = false;
    let mut includes = Vec::new();

    for line in content.lines() {
        if !in_packaging {
            if line == "packaging:" {
                in_packaging = true;
            }
            continue;
        }

        if line.chars().next().is_some_and(|ch| !ch.is_whitespace()) {
            break;
        }

        if let Some(profile_name) = line
            .strip_prefix("  ")
            .and_then(|value| value.strip_suffix(':'))
        {
            if !profile_name.contains(' ') {
                in_profile = profile_name == profile;
                in_include = false;
                continue;
            }
        }

        if !in_profile {
            continue;
        }

        if line == "    include:" {
            in_include = true;
            continue;
        }

        if line.starts_with("    ") && line.ends_with(':') && line != "    include:" {
            in_include = false;
            continue;
        }

        if !in_include {
            continue;
        }

        if let Some(include_path) = line.strip_prefix("      - ") {
            includes.push(include_path.trim_matches('"').to_string());
        }
    }

    if includes.is_empty() {
        None
    } else {
        Some(includes)
    }
}

fn manifest_relative_files(skill_dir: &Path, profile: &str) -> Result<Option<Vec<String>>> {
    let config_path = skill_dir.join("config.yaml");
    if !config_path.exists() {
        return Ok(None);
    }

    let config_content = read_file(&config_path)?;
    let Some(include_list) = parse_packaging_include_list(&config_content, profile) else {
        return Ok(None);
    };

    let mut relative_files = Vec::new();
    for include_path in include_list {
        if include_path == "**" {
            collect_files(skill_dir, skill_dir, &mut relative_files)?;
            continue;
        }

        let normalized_path = include_path.trim_end_matches('/');
        let source_path = skill_dir.join(normalized_path);
        if !source_path.exists() {
            continue;
        }

        if source_path.is_dir() {
            collect_files(skill_dir, &source_path, &mut relative_files)?;
        } else {
            relative_files.push(normalized_path.replace('\\', "/"));
        }
    }

    relative_files.sort();
    relative_files.dedup();
    Ok(Some(relative_files))
}

fn json_string_field(content: &str, field: &str) -> Option<String> {
    let marker = format!("\"{field}\"");
    let field_start = content.find(&marker)?;
    let after_field = &content[field_start + marker.len()..];
    let colon = after_field.find(':')?;
    let after_colon = after_field[colon + 1..].trim_start();
    let after_quote = after_colon.strip_prefix('"')?;
    let end_quote = after_quote.find('"')?;
    Some(after_quote[..end_quote].to_string())
}

fn replace_json_string_field(content: String, field: &str, value: &str) -> String {
    let marker = format!("\"{field}\"");
    let Some(field_start) = content.find(&marker) else {
        return content;
    };
    let after_field_start = field_start + marker.len();
    let Some(colon_relative) = content[after_field_start..].find(':') else {
        return content;
    };
    let value_search_start = after_field_start + colon_relative + 1;
    let Some(open_quote_relative) = content[value_search_start..].find('"') else {
        return content;
    };
    let value_start = value_search_start + open_quote_relative + 1;
    let Some(close_quote_relative) = content[value_start..].find('"') else {
        return content;
    };
    let value_end = value_start + close_quote_relative;

    format!(
        "{}{}{}",
        &content[..value_start],
        json_escape(value),
        &content[value_end..]
    )
}

#[napi]
pub fn sync_plugin_manifests(root: String, target_root: String) -> Result<String> {
    let root_path = Path::new(&root);
    let target_path = Path::new(&target_root);
    let package_json = read_file(&root_path.join("package.json"))?;
    let version = json_string_field(&package_json, "version").unwrap_or_else(|| "0.0.0".to_string());
    let description = json_string_field(&package_json, "description").unwrap_or_default();

    let claude = replace_json_string_field(
        replace_json_string_field(
            read_file(&root_path.join(".claude-plugin/plugin.json"))?,
            "description",
            &description,
        ),
        "version",
        &version,
    );
    let cursor = replace_json_string_field(
        replace_json_string_field(
            read_file(&root_path.join(".cursor-plugin/plugin.json"))?,
            "description",
            &description,
        ),
        "version",
        &version,
    );
    let marketplace = replace_json_string_field(
        replace_json_string_field(
            read_file(&root_path.join(".claude-plugin/marketplace.json"))?,
            "description",
            &description,
        ),
        "version",
        &version,
    );

    write_file(&target_path.join(".claude-plugin/plugin.json"), &claude)?;
    write_file(&target_path.join(".cursor-plugin/plugin.json"), &cursor)?;
    write_file(&target_path.join(".claude-plugin/marketplace.json"), &marketplace)?;

    Ok(target_path.to_string_lossy().to_string())
}

fn frontmatter_string(content: &str, key: &str) -> Option<String> {
    content.lines().find_map(|line| {
        let prefix = format!("{key}:");
        line.strip_prefix(&prefix)
            .map(|value| value.trim().trim_matches('"').to_string())
    })
}

fn alias_target_dir(tool: &str, target_root: &Path) -> Result<PathBuf> {
    match tool {
        "claude-code" => Ok(target_root.join(".claude/commands")),
        "cursor" => Ok(target_root.join(".cursor/commands")),
        _ => Err(Error::from_reason(format!("unsupported alias tool: {tool}"))),
    }
}

fn alias_content(tool: &str, trigger: &str, skill_name: &str) -> String {
    if tool == "claude-code" {
        format!(
            "# {trigger}\n\nUse the `/{skill_name}` skill with the following input:\n\n$ARGUMENTS\n"
        )
    } else {
        format!(
            "# {trigger}\n\nUse the `{skill_name}` skill/rule with the following input:\n\n$ARGUMENTS\n"
        )
    }
}

#[napi]
pub fn generate_aliases(root: String, target_root: String, tool: String) -> Result<u32> {
    let root_path = Path::new(&root);
    let target_dir = alias_target_dir(&tool, Path::new(&target_root))?;
    fs::create_dir_all(&target_dir)
        .map_err(|err| Error::from_reason(format!("failed to create alias directory: {err}")))?;

    let mut count = 0;
    for entry in fs::read_dir(root_path.join("skills"))
        .map_err(|err| Error::from_reason(format!("failed to read skills directory: {err}")))?
    {
        let entry = entry.map_err(|err| Error::from_reason(format!("failed to read skill entry: {err}")))?;
        if !entry
            .file_type()
            .map_err(|err| Error::from_reason(format!("failed to read skill entry type: {err}")))?
            .is_dir()
        {
            continue;
        }

        let skill_name = entry.file_name().to_string_lossy().to_string();
        let content = read_file(&entry.path().join("SKILL.md"))?;
        let Some(trigger) = frontmatter_string(&content, "trigger") else {
            continue;
        };
        if !trigger.starts_with('/') {
            continue;
        }

        let alias_name = format!("{}.md", trigger.trim_start_matches('/'));
        write_file(&target_dir.join(alias_name), &alias_content(&tool, &trigger, &skill_name))?;
        count += 1;
    }

    Ok(count)
}

fn collect_files(base: &Path, current: &Path, entries: &mut Vec<String>) -> Result<()> {
    for item in fs::read_dir(current)
        .map_err(|err| Error::from_reason(format!("failed to read {}: {err}", current.display())))?
    {
        let item = item.map_err(|err| Error::from_reason(format!("failed to read directory entry: {err}")))?;
        let path = item.path();
        if item
            .file_type()
            .map_err(|err| Error::from_reason(format!("failed to read directory entry type: {err}")))?
            .is_dir()
        {
            collect_files(base, &path, entries)?;
        } else {
            let relative = path
                .strip_prefix(base)
                .map_err(|err| Error::from_reason(format!("failed to strip path prefix: {err}")))?;
            entries.push(relative.to_string_lossy().replace('\\', "/"));
        }
    }
    Ok(())
}

#[napi]
pub fn build_package_plan(root: String, profile: String) -> Result<Vec<PackagePlanEntry>> {
    if !["minimal", "standard", "full"].contains(&profile.as_str()) {
        return Err(Error::from_reason(format!("unsupported package profile: {profile}")));
    }

    let skills_dir = Path::new(&root).join("skills");
    let mut plan = Vec::new();
    let entries = fs::read_dir(&skills_dir)
        .map_err(|err| Error::from_reason(format!("failed to read skills directory: {err}")))?;

    for entry in entries {
        let entry = entry.map_err(|err| Error::from_reason(format!("failed to read skill entry: {err}")))?;
        if !entry
            .file_type()
            .map_err(|err| Error::from_reason(format!("failed to read skill entry type: {err}")))?
            .is_dir()
        {
            continue;
        }

        let skill_name = entry.file_name().to_string_lossy().to_string();
        let skill_dir = entry.path();
        let mut relative_files = if let Some(manifest_files) = manifest_relative_files(&skill_dir, &profile)? {
            manifest_files
        } else {
            Vec::new()
        };

        if relative_files.is_empty() {
            relative_files.push("SKILL.md".to_string());
            if skill_dir.join("config.yaml").exists() {
                relative_files.push("config.yaml".to_string());
            }

            if profile == "standard" || profile == "full" {
                for child in ["references", "assets"] {
                    let child_path = skill_dir.join(child);
                    if child_path.exists() {
                        collect_files(&skill_dir, &child_path, &mut relative_files)?;
                    }
                }
            }

            if profile == "full" {
                relative_files.clear();
                collect_files(&skill_dir, &skill_dir, &mut relative_files)?;
            }
        }

        relative_files.sort();
        for relative_path in relative_files {
            plan.push(PackagePlanEntry {
                skill_name: skill_name.clone(),
                relative_path,
            });
        }
    }

    Ok(plan)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;
    use std::time::{SystemTime, UNIX_EPOCH};

    fn fixture_path(name: &str) -> PathBuf {
        Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("..")
            .join("..")
            .join("tests")
            .join("fixtures")
            .join(name)
    }

    fn temp_root(label: &str) -> String {
        let nanos = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("system time should be after epoch")
            .as_nanos();
        let path = std::env::temp_dir().join(format!("danny-skill-{label}-{nanos}"));
        path.to_string_lossy().to_string()
    }

    #[test]
    fn writes_config_paths() {
        let root = temp_root("config");
        let config_path = write_config_paths(
            root.clone(),
            ".custom/project".to_string(),
            "~/custom/global".to_string(),
        )
        .expect("config should be written");

        let content = fs::read_to_string(config_path).expect("config file should exist");
        assert!(content.contains("\"project\": \".custom/project\""));
        assert!(content.contains("\"global\": \"~/custom/global\""));
        fs::remove_dir_all(root).ok();
    }

    #[test]
    fn initializes_project_knowledge() {
        let root = temp_root("knowledge");
        let base = init_project_knowledge(root.clone(), ".knowledge".to_string())
            .expect("knowledge directories should be created");

        assert!(Path::new(&base).join("inbox/inspiration").exists());
        assert!(Path::new(&base)
            .join("learnings/patterns/PATTERNS.md")
            .exists());
        let patterns = fs::read_to_string(Path::new(&base).join("learnings/patterns/PATTERNS.md"))
            .expect("patterns file should be readable");
        assert_eq!(patterns, DEFAULT_PATTERNS_TEMPLATE);
        fs::remove_dir_all(root).ok();
    }

    #[test]
    fn extracts_json_string_field() {
        let content = r#"{"version":"1.2.3","description":"hello"}"#;
        assert_eq!(json_string_field(content, "version").as_deref(), Some("1.2.3"));
        assert_eq!(json_string_field(content, "description").as_deref(), Some("hello"));
    }

    #[test]
    fn package_plan_rejects_unknown_profile() {
        let error = build_package_plan(".".to_string(), "unknown".to_string()).unwrap_err();
        assert!(error.reason.contains("unsupported package profile"));
    }

    #[test]
    fn parses_packaging_include_list_from_shared_fixture() {
        let content = fs::read_to_string(fixture_path("manifest-fixture.yaml"))
            .expect("fixture should be readable");

        assert_eq!(
            parse_packaging_include_list(&content, "minimal"),
            Some(vec!["SKILL.md".to_string(), "config.yaml".to_string()])
        );
        assert_eq!(
            parse_packaging_include_list(&content, "standard"),
            Some(vec![
                "SKILL.md".to_string(),
                "config.yaml".to_string(),
                "references/example.md".to_string(),
                "assets/example.json".to_string(),
            ])
        );
        assert_eq!(
            parse_packaging_include_list(&content, "full"),
            Some(vec!["**".to_string()])
        );
        assert_eq!(parse_packaging_include_list(&content, "missing"), None);
    }

    #[test]
    fn parses_validation_spec_from_shared_fixture() {
        let content = fs::read_to_string(fixture_path("manifest-fixture.yaml"))
            .expect("fixture should be readable");
        let spec = parse_validation_spec(&content);

        assert_eq!(
            spec.required_files,
            vec!["SKILL.md".to_string(), "references/example.md".to_string()]
        );
        assert_eq!(spec.json_files, vec!["assets/example.json".to_string()]);
        assert_eq!(spec.markdown_contracts.len(), 1);
        assert_eq!(spec.markdown_contracts[0].path, "references/example.md");
        assert_eq!(
            spec.markdown_contracts[0].must_contain,
            vec!["## Section A".to_string(), "## Section B".to_string()]
        );
    }

    #[test]
    fn validate_skills_reports_categorized_errors_for_invalid_json() {
        let root = temp_root("validate-invalid-json");
        let skill_dir = Path::new(&root).join("skills/example-skill");
        fs::create_dir_all(skill_dir.join("references")).expect("references directory should be created");
        fs::create_dir_all(skill_dir.join("assets")).expect("assets directory should be created");
        fs::write(
            skill_dir.join("config.yaml"),
            fs::read_to_string(fixture_path("manifest-fixture.yaml")).expect("fixture should be readable"),
        )
        .expect("config file should be written");
        fs::write(
            skill_dir.join("SKILL.md"),
            "---\nname: example-skill\ndescription: Use when validating fixture behavior\nversion: \"1.0\"\ntriggers: [example]\nsupported_tools: [codex]\n---\n",
        )
        .expect("skill file should be written");
        fs::write(skill_dir.join("references/example.md"), "## Section A\n## Section B\n")
            .expect("markdown contract file should be written");
        fs::write(skill_dir.join("assets/example.json"), "{\n")
            .expect("invalid json fixture should be written");

        let result = validate_skills(root.clone()).expect("validation should run");

        assert!(!result.ok);
        assert_eq!(result.skill_count, 1);
        assert_eq!(result.error_count, 1);
        assert_eq!(
            result.errors,
            vec!["example-skill: [json_files] invalid json file assets/example.json".to_string()]
        );
        assert_eq!(result.errors_by_category.len(), 1);
        assert_eq!(result.errors_by_category[0].category, "json_files");
        assert_eq!(
            result.errors_by_category[0].errors,
            vec!["example-skill: [json_files] invalid json file assets/example.json".to_string()]
        );

        fs::remove_dir_all(root).ok();
    }

    #[test]
    fn packaged_validation_skips_manifest_files_not_shipped_in_profile() {
        let root = temp_root("validate-packaged-dist");
        let dist_root = Path::new(&root).join("dist");
        let skill_dir = dist_root.join("skills/example-skill");
        fs::create_dir_all(&skill_dir).expect("skill directory should be created");
        fs::write(
            skill_dir.join("config.yaml"),
            fs::read_to_string(fixture_path("manifest-fixture.yaml")).expect("fixture should be readable"),
        )
        .expect("config file should be written");
        fs::write(
            skill_dir.join("SKILL.md"),
            "---\nname: example-skill\ndescription: Use when validating packaged behavior\nversion: \"1.0\"\ntriggers: [example]\nsupported_tools: [codex]\n---\n",
        )
        .expect("skill file should be written");

        let result = validate_skills(dist_root.to_string_lossy().to_string()).expect("validation should run");

        assert!(result.ok);
        assert_eq!(result.skill_count, 1);
        assert_eq!(result.error_count, 0);
        assert!(result.errors.is_empty());
        assert!(result.errors_by_category.is_empty());

        fs::remove_dir_all(root).ok();
    }

    #[test]
    fn standard_design_style_package_includes_lightweight_references_only() {
        let root = temp_root("package-plan-standard-design-style");
        let skill_dir = Path::new(&root).join("skills/design-style");
        fs::create_dir_all(skill_dir.join("references/designs/spacex"))
            .expect("design bundle directory should be created");
        fs::create_dir_all(skill_dir.join("assets")).expect("assets directory should be created");
        fs::write(
            skill_dir.join("config.yaml"),
            "packaging:\n  standard:\n    include:\n      - \"SKILL.md\"\n      - \"config.yaml\"\n      - \"references/style-selection-guide.md\"\n      - \"references/scene-templates.md\"\n      - \"references/critique-guide.md\"\n      - \"assets/preview.html\"\n",
        )
        .expect("config file should be written");
        fs::write(skill_dir.join("SKILL.md"), "---\nname: design-style\n")
            .expect("skill file should be written");
        fs::write(
            skill_dir.join("references/style-selection-guide.md"),
            "# style selection guide\n",
        )
        .expect("style selection guide should be written");
        fs::write(
            skill_dir.join("references/scene-templates.md"),
            "# scene templates\n",
        )
        .expect("scene templates should be written");
        fs::write(
            skill_dir.join("references/critique-guide.md"),
            "# critique guide\n",
        )
        .expect("critique guide should be written");
        fs::write(
            skill_dir.join("references/designs/spacex/preview.html"),
            "<html></html>\n",
        )
        .expect("design bundle file should be written");
        fs::write(skill_dir.join("assets/preview.html"), "<html></html>\n")
            .expect("asset preview should be written");

        let plan = build_package_plan(root.clone(), "standard".to_string())
            .expect("package plan should be built");
        let design_style_paths: Vec<_> = plan
            .iter()
            .filter(|entry| entry.skill_name == "design-style")
            .map(|entry| entry.relative_path.as_str())
            .collect();

        assert!(design_style_paths.contains(&"SKILL.md"));
        assert!(design_style_paths.contains(&"config.yaml"));
        assert!(design_style_paths.contains(&"assets/preview.html"));
        assert!(design_style_paths.contains(&"references/style-selection-guide.md"));
        assert!(design_style_paths.contains(&"references/scene-templates.md"));
        assert!(design_style_paths.contains(&"references/critique-guide.md"));
        assert!(!design_style_paths.contains(&"references/designs/spacex/preview.html"));

        fs::remove_dir_all(root).ok();
    }

    #[test]
    fn standard_package_without_manifest_uses_default_behavior() {
        let root = temp_root("package-plan-standard-default");
        let skill_dir = Path::new(&root).join("skills/example-skill");
        fs::create_dir_all(skill_dir.join("references")).expect("references directory should be created");
        fs::create_dir_all(skill_dir.join("assets")).expect("assets directory should be created");
        fs::write(skill_dir.join("SKILL.md"), "---\nname: example-skill\n")
            .expect("skill file should be written");
        fs::write(skill_dir.join("references/guide.md"), "# guide\n")
            .expect("reference file should be written");
        fs::write(skill_dir.join("assets/preview.txt"), "preview\n")
            .expect("asset file should be written");

        let plan = build_package_plan(root.clone(), "standard".to_string())
            .expect("package plan should be built");
        let example_paths: Vec<_> = plan
            .iter()
            .filter(|entry| entry.skill_name == "example-skill")
            .map(|entry| entry.relative_path.as_str())
            .collect();

        assert!(example_paths.contains(&"SKILL.md"));
        assert!(example_paths.contains(&"references/guide.md"));
        assert!(example_paths.contains(&"assets/preview.txt"));

        fs::remove_dir_all(root).ok();
    }
}
