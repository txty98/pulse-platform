"use client";

import { useMemo, useState } from "react";
import { saveFormBuilder } from "../actions";

type FormField = {
  id: string;
  type: "text" | "email" | "textarea" | "select" | "checkbox";
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
};

type FormBuilderProps = {
  tenantSlug: string;
  form: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    status: string;
    schema: FormField[];
  };
};

const FIELD_TEMPLATES: Array<{
  type: FormField["type"];
  label: string;
}> = [
  { type: "text", label: "Text" },
  { type: "email", label: "Email" },
  { type: "textarea", label: "Paragraph" },
  { type: "select", label: "Dropdown" },
  { type: "checkbox", label: "Checkbox" }
];

function createField(type: FormField["type"]): FormField {
  return {
    id: crypto.randomUUID(),
    type,
    label: `New ${type} field`,
    placeholder: "",
    required: false,
    options: type === "select" ? ["Option 1", "Option 2"] : undefined
  };
}

export function FormBuilder({ tenantSlug, form }: FormBuilderProps) {
  const [fields, setFields] = useState<FormField[]>(form.schema);
  const [draggedFieldId, setDraggedFieldId] = useState<string | null>(null);
  const serializedSchema = useMemo(() => JSON.stringify(fields), [fields]);

  function updateField(fieldId: string, nextField: Partial<FormField>) {
    setFields((currentFields) =>
      currentFields.map((field) => (field.id === fieldId ? { ...field, ...nextField } : field))
    );
  }

  function removeField(fieldId: string) {
    setFields((currentFields) => currentFields.filter((field) => field.id !== fieldId));
  }

  function moveField(targetFieldId: string) {
    if (!draggedFieldId || draggedFieldId === targetFieldId) {
      return;
    }

    setFields((currentFields) => {
      const draggedField = currentFields.find((field) => field.id === draggedFieldId);
      const targetIndex = currentFields.findIndex((field) => field.id === targetFieldId);

      if (!draggedField || targetIndex === -1) {
        return currentFields;
      }

      const remainingFields = currentFields.filter((field) => field.id !== draggedFieldId);
      remainingFields.splice(targetIndex, 0, draggedField);
      return remainingFields;
    });
  }

  return (
    <form action={saveFormBuilder} className="forms-builder">
      <input name="tenant" type="hidden" value={tenantSlug} />
      <input name="form_id" type="hidden" value={form.id} />
      <input name="schema" type="hidden" value={serializedSchema} />

      <div className="forms-builder-top">
        <label className="field">
          <span>Form Name</span>
          <input defaultValue={form.name} name="name" type="text" required />
        </label>

        <label className="field">
          <span>Public Slug</span>
          <input defaultValue={form.slug} name="slug" type="text" required />
        </label>
      </div>

      <label className="field">
        <span>Description</span>
        <textarea
          className="note-textarea"
          defaultValue={form.description ?? ""}
          name="description"
          placeholder="Tell people what this form is for."
          rows={4}
        />
      </label>

      <div className="forms-builder-layout">
        <aside className="forms-palette">
          <h3>Field Palette</h3>
          <div className="forms-palette-list">
            {FIELD_TEMPLATES.map((fieldTemplate) => (
              <button
                className="section-action-button"
                key={fieldTemplate.type}
                onClick={() => setFields((currentFields) => [...currentFields, createField(fieldTemplate.type)])}
                type="button"
              >
                Add {fieldTemplate.label}
              </button>
            ))}
          </div>
        </aside>

        <section className="forms-canvas">
          <div className="panel-header">
            <div>
              <h2>Builder</h2>
              <p className="panel-copy">Drag fields to reorder them and edit the configuration inline.</p>
            </div>
          </div>

          {fields.length > 0 ? (
            <div className="forms-field-list">
              {fields.map((field) => (
                <article
                  className="forms-field-card"
                  draggable
                  key={field.id}
                  onDragOver={(event) => event.preventDefault()}
                  onDragStart={() => setDraggedFieldId(field.id)}
                  onDrop={() => moveField(field.id)}
                >
                  <div className="forms-field-header">
                    <strong>{field.type}</strong>
                    <button className="forms-field-remove" onClick={() => removeField(field.id)} type="button">
                      Remove
                    </button>
                  </div>

                  <label className="field">
                    <span>Label</span>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(event) => updateField(field.id, { label: event.target.value })}
                    />
                  </label>

                  {field.type !== "checkbox" ? (
                    <label className="field">
                      <span>Placeholder</span>
                      <input
                        type="text"
                        value={field.placeholder ?? ""}
                        onChange={(event) => updateField(field.id, { placeholder: event.target.value })}
                      />
                    </label>
                  ) : null}

                  {field.type === "select" ? (
                    <label className="field">
                      <span>Options</span>
                      <textarea
                        className="note-textarea"
                        rows={4}
                        value={(field.options ?? []).join("\n")}
                        onChange={(event) =>
                          updateField(field.id, {
                            options: event.target.value
                              .split("\n")
                              .map((value) => value.trim())
                              .filter(Boolean)
                          })
                        }
                      />
                    </label>
                  ) : null}

                  <label className="checkbox-field">
                    <input
                      checked={field.required}
                      className="checkbox-input"
                      onChange={(event) => updateField(field.id, { required: event.target.checked })}
                      type="checkbox"
                    />
                    <span>Required field</span>
                  </label>
                </article>
              ))}
            </div>
          ) : (
            <div className="people-empty-state">
              <h3>No fields yet</h3>
              <p>Add fields from the palette to start building the public form.</p>
            </div>
          )}
        </section>
      </div>

      <div className="forms-builder-actions">
        <button className="secondary-button" name="intent" type="submit" value="draft">
          Save Draft
        </button>
        <button className="primary-button forms-publish-button" name="intent" type="submit" value="publish">
          Publish Form
        </button>
      </div>
    </form>
  );
}
