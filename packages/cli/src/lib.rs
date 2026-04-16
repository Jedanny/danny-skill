use napi::bindgen_prelude::*;
use napi_derive::napi;
use std::fs;
use std::path::{Path, PathBuf};

#[napi(object)]
pub struct ValidationResult {
    pub ok: bool,
    pub skill_count: u32,
    pub errors: Vec<String>,
}

#[napi]
pub fn validate_skills(root: String) -> Result<ValidationResult> {
    let skills_dir = Path::new(&root).join("skills");
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
                errors.push(format!("{skill_name}: missing SKILL.md"));
                continue;
            }
        };

        if !content.contains(&format!("name: {skill_name}")) {
            errors.push(format!(
                "{skill_name}: frontmatter name must match directory"
            ));
        }

        if !content.contains("description: Use when")
            && !content.contains("description: \"Use when")
        {
            errors.push(format!(
                "{skill_name}: description must start with \"Use when\""
            ));
        }
    }

    Ok(ValidationResult {
        ok: errors.is_empty(),
        skill_count,
        errors,
    })
}

fn json_escape(value: &str) -> String {
    value.replace('\\', "\\\\").replace('"', "\\\"")
}

#[napi]
pub fn write_config_paths(root: String, project_path: String, global_path: String) -> Result<String> {
    let config_dir = Path::new(&root).join(".danny-skill");
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
        fs::write(
            &patterns_path,
            "# Learning Patterns\n\n## Agent 使用入口\n\n后续 Agent 执行任务前，先按任务关键词、工具和错误信息扫描本文件。\n",
        )
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

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::{SystemTime, UNIX_EPOCH};

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
        fs::remove_dir_all(root).ok();
    }

    #[test]
    fn extracts_json_string_field() {
        let content = r#"{"version":"1.2.3","description":"hello"}"#;
        assert_eq!(json_string_field(content, "version").as_deref(), Some("1.2.3"));
        assert_eq!(json_string_field(content, "description").as_deref(), Some("hello"));
    }
}
