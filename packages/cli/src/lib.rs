use napi::bindgen_prelude::*;
use napi_derive::napi;
use std::fs;
use std::path::Path;

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
}
