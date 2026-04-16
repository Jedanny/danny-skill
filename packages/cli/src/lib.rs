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
