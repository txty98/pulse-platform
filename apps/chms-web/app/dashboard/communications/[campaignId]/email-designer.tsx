"use client";

import { useMemo, useState } from "react";
import { saveCampaignDesigner } from "../actions";

type EmailColumn = {
  id: string;
  heading: string;
  text: string;
  buttonLabel?: string;
  buttonUrl?: string;
};

type EmailBlock = {
  id: string;
  type: "heading" | "text" | "button" | "divider" | "image" | "columns-2" | "columns-3";
  content?: string;
  buttonLabel?: string;
  buttonUrl?: string;
  imageUrl?: string;
  columns?: EmailColumn[];
};

type EmailDesignerProps = {
  tenantSlug: string;
  campaign: {
    id: string;
    name: string;
    subject: string;
    preview_text: string | null;
    status: string;
    audience:
      | {
          type?: string;
          group_ids?: string[];
          person_ids?: string[];
        }
      | null;
    design: EmailBlock[];
  };
  groups: Array<{
    id: string;
    name: string;
  }>;
  people: Array<{
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
  }>;
  groupMembers: Array<{
    group_id: string;
    person_id: string;
  }>;
};

type DragItem =
  | {
      kind: "existing";
      blockId: string;
    }
  | {
      kind: "template";
      blockType: EmailBlock["type"];
    };

const BLOCK_TEMPLATES: Array<{ type: EmailBlock["type"]; label: string }> = [
  { type: "heading", label: "Heading" },
  { type: "text", label: "Text" },
  { type: "button", label: "Button" },
  { type: "image", label: "Image" },
  { type: "divider", label: "Divider" },
  { type: "columns-2", label: "2 Columns" },
  { type: "columns-3", label: "3 Columns" }
];

function createColumns(count: number): EmailColumn[] {
  return Array.from({ length: count }, (_, index) => ({
    id: crypto.randomUUID(),
    heading: `Column ${index + 1}`,
    text: "Add supporting content for this section.",
    buttonLabel: "Learn More",
    buttonUrl: "https://pulse-rms.com"
  }));
}

function createBlock(type: EmailBlock["type"]): EmailBlock {
  const base = {
    id: crypto.randomUUID(),
    type
  };

  switch (type) {
    case "heading":
      return { ...base, content: "New heading" };
    case "text":
      return { ...base, content: "Write your message here." };
    case "button":
      return { ...base, buttonLabel: "Learn More", buttonUrl: "https://pulse-rms.com" };
    case "image":
      return { ...base, imageUrl: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1200&q=80" };
    case "divider":
      return base;
    case "columns-2":
      return { ...base, columns: createColumns(2) };
    case "columns-3":
      return { ...base, columns: createColumns(3) };
  }
}

function formatName(person: { first_name: string; last_name: string }) {
  return `${person.first_name} ${person.last_name}`;
}

export function EmailDesigner({ tenantSlug, campaign, groups, people, groupMembers }: EmailDesignerProps) {
  const [blocks, setBlocks] = useState<EmailBlock[]>(campaign.design);
  const [dragItem, setDragItem] = useState<DragItem | null>(null);
  const [isCanvasDragging, setIsCanvasDragging] = useState(false);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [audienceMode, setAudienceMode] = useState(
    campaign.audience?.type === "custom" ? "custom" : "all"
  );
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(campaign.audience?.group_ids ?? []);
  const [selectedPersonIds, setSelectedPersonIds] = useState<string[]>(campaign.audience?.person_ids ?? []);
  const serializedDesign = useMemo(() => JSON.stringify(blocks), [blocks]);
  const recipientSummary = useMemo(() => {
    const peopleWithEmail = people.filter((person) => person.email);

    if (audienceMode === "all") {
      return {
        count: peopleWithEmail.length,
        label: "All people with email"
      };
    }

    const recipientIds = new Set<string>();

    for (const groupId of selectedGroupIds) {
      for (const member of groupMembers) {
        if (member.group_id === groupId) {
          recipientIds.add(member.person_id);
        }
      }
    }

    for (const personId of selectedPersonIds) {
      recipientIds.add(personId);
    }

    const count = peopleWithEmail.filter((person) => recipientIds.has(person.id)).length;

    return {
      count,
      label: "Custom audience"
    };
  }, [audienceMode, groupMembers, people, selectedGroupIds, selectedPersonIds]);

  function updateBlock(blockId: string, nextBlock: Partial<EmailBlock>) {
    setBlocks((currentBlocks) =>
      currentBlocks.map((block) => (block.id === blockId ? { ...block, ...nextBlock } : block))
    );
  }

  function updateColumn(blockId: string, columnId: string, nextColumn: Partial<EmailColumn>) {
    setBlocks((currentBlocks) =>
      currentBlocks.map((block) =>
        block.id === blockId
          ? {
              ...block,
              columns: (block.columns ?? []).map((column) =>
                column.id === columnId ? { ...column, ...nextColumn } : column
              )
            }
          : block
      )
    );
  }

  function removeBlock(blockId: string) {
    setBlocks((currentBlocks) => currentBlocks.filter((block) => block.id !== blockId));
  }

  function insertDragItem(targetIndex: number) {
    if (!dragItem) {
      return;
    }

    setBlocks((currentBlocks) => {
      if (dragItem.kind === "template") {
        const nextBlocks = [...currentBlocks];
        nextBlocks.splice(targetIndex, 0, createBlock(dragItem.blockType));
        return nextBlocks;
      }

      const sourceIndex = currentBlocks.findIndex((block) => block.id === dragItem.blockId);

      if (sourceIndex === -1) {
        return currentBlocks;
      }

      const nextBlocks = [...currentBlocks];
      const [movedBlock] = nextBlocks.splice(sourceIndex, 1);
      const adjustedTargetIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
      nextBlocks.splice(adjustedTargetIndex, 0, movedBlock);
      return nextBlocks;
    });

    setDragItem(null);
    setIsCanvasDragging(false);
    setDropIndex(null);
  }

  function moveBlock(targetBlockId: string) {
    if (!dragItem) {
      return;
    }

    const targetIndex = blocks.findIndex((block) => block.id === targetBlockId);

    if (targetIndex === -1) {
      return;
    }

    if (dragItem.kind === "existing" && dragItem.blockId === targetBlockId) {
      return;
    }

    insertDragItem(targetIndex);
  }

  function appendDragItem() {
    insertDragItem(blocks.length);
  }

  function beginDrag(nextDragItem: DragItem) {
    setDragItem(nextDragItem);
    setIsCanvasDragging(true);
  }

  function endDrag() {
    setDragItem(null);
    setIsCanvasDragging(false);
    setDropIndex(null);
  }

  return (
    <form action={saveCampaignDesigner} className="forms-builder">
      <input name="tenant" type="hidden" value={tenantSlug} />
      <input name="campaign_id" type="hidden" value={campaign.id} />
      <input name="design" type="hidden" value={serializedDesign} />
      <input name="audience_mode" type="hidden" value={audienceMode} />
      {selectedGroupIds.map((groupId) => (
        <input key={groupId} name="audience_group_ids" type="hidden" value={groupId} />
      ))}
      {selectedPersonIds.map((personId) => (
        <input key={personId} name="audience_person_ids" type="hidden" value={personId} />
      ))}

      <div className="forms-builder-top">
        <label className="field">
          <span>Campaign Name</span>
          <input defaultValue={campaign.name} name="name" type="text" required />
        </label>

        <label className="field">
          <span>Email Subject</span>
          <input defaultValue={campaign.subject} name="subject" type="text" required />
        </label>
      </div>

      <label className="field">
        <span>Preview Text</span>
        <input
          defaultValue={campaign.preview_text ?? ""}
          name="preview_text"
          type="text"
          placeholder="Short inbox preview shown beside the subject line."
        />
      </label>

      <section className="communications-audience-panel">
        <div className="panel-header">
          <div>
            <h2>Audience</h2>
            <p className="panel-copy">Choose who should receive this communication by groups and individual people.</p>
          </div>
        </div>

        <div className="communications-audience-modes">
          <label className="checkbox-field">
            <input
              checked={audienceMode === "all"}
              className="checkbox-input"
              name="audience_mode_ui"
              onChange={() => setAudienceMode("all")}
              type="radio"
            />
            <span>All people with email</span>
          </label>

          <label className="checkbox-field">
            <input
              checked={audienceMode === "custom"}
              className="checkbox-input"
              name="audience_mode_ui"
              onChange={() => setAudienceMode("custom")}
              type="radio"
            />
            <span>Specific groups and people</span>
          </label>
        </div>

        {audienceMode === "custom" ? (
          <div className="communications-audience-grid">
            <div className="communications-audience-column">
              <strong>Groups</strong>
              <div className="communications-audience-list">
                {groups.map((group) => (
                  <label className="checkbox-field" key={group.id}>
                    <input
                      checked={selectedGroupIds.includes(group.id)}
                      className="checkbox-input"
                      onChange={(event) =>
                        setSelectedGroupIds((currentIds) =>
                          event.target.checked
                            ? [...currentIds, group.id]
                            : currentIds.filter((currentId) => currentId !== group.id)
                        )
                      }
                      type="checkbox"
                    />
                    <span>{group.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="communications-audience-column">
              <strong>Individuals</strong>
              <div className="communications-audience-list">
                {people.filter((person) => person.email).map((person) => (
                  <label className="checkbox-field" key={person.id}>
                    <input
                      checked={selectedPersonIds.includes(person.id)}
                      className="checkbox-input"
                      onChange={(event) =>
                        setSelectedPersonIds((currentIds) =>
                          event.target.checked
                            ? [...currentIds, person.id]
                            : currentIds.filter((currentId) => currentId !== person.id)
                        )
                      }
                      type="checkbox"
                    />
                    <span>{formatName(person)}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <div className="communications-builder-layout">
        <aside className="forms-palette">
          <h3>Content Blocks</h3>
          <div className="forms-palette-list">
            {BLOCK_TEMPLATES.map((template) => (
              <button
                className="section-action-button communications-palette-button"
                draggable
                key={template.type}
                onClick={() => setBlocks((currentBlocks) => [...currentBlocks, createBlock(template.type)])}
                onDragEnd={endDrag}
                onDragStart={() => beginDrag({ kind: "template", blockType: template.type })}
                type="button"
              >
                Add {template.label}
              </button>
            ))}
          </div>
        </aside>

        <section
          className={`forms-canvas ${isCanvasDragging ? "communications-canvas-active" : ""}`}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsCanvasDragging(true);
          }}
          onDragLeave={(event) => {
            if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
              return;
            }

            setIsCanvasDragging(false);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            event.stopPropagation();

            if (!dragItem) {
              return;
            }

            appendDragItem();
          }}
        >
          <div className="panel-header">
            <div>
              <h2>Designer</h2>
              <p className="panel-copy">Drag blocks in from the palette or reorder existing content inline.</p>
            </div>
          </div>

          {blocks.length > 0 ? (
            <div className="forms-field-list">
              {blocks.map((block, index) => (
                <div key={block.id}>
                  <div
                    className={`communications-drop-indicator ${dropIndex === index ? "is-visible" : ""}`}
                    onDragEnter={(event) => {
                      event.preventDefault();
                      setDropIndex(index);
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDropIndex(index);
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      insertDragItem(index);
                    }}
                  >
                    <span>Drop block here</span>
                  </div>

                  <article
                    className="forms-field-card"
                    draggable
                    onDragOver={(event) => event.preventDefault()}
                    onDragEnd={endDrag}
                    onDragStart={() => beginDrag({ kind: "existing", blockId: block.id })}
                    onDrop={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      moveBlock(block.id);
                    }}
                  >
                    <div className="forms-field-header">
                      <strong>{block.type}</strong>
                      <button className="forms-field-remove" onClick={() => removeBlock(block.id)} type="button">
                        Remove
                      </button>
                    </div>

                    {block.type === "heading" || block.type === "text" ? (
                      <label className="field">
                        <span>Content</span>
                        <textarea
                          className="note-textarea"
                          rows={block.type === "heading" ? 3 : 5}
                          value={block.content ?? ""}
                          onChange={(event) => updateBlock(block.id, { content: event.target.value })}
                        />
                      </label>
                    ) : null}

                    {block.type === "button" ? (
                      <>
                        <label className="field">
                          <span>Button Label</span>
                          <input
                            type="text"
                            value={block.buttonLabel ?? ""}
                            onChange={(event) => updateBlock(block.id, { buttonLabel: event.target.value })}
                          />
                        </label>
                        <label className="field">
                          <span>Button URL</span>
                          <input
                            type="url"
                            value={block.buttonUrl ?? ""}
                            onChange={(event) => updateBlock(block.id, { buttonUrl: event.target.value })}
                          />
                        </label>
                      </>
                    ) : null}

                    {block.type === "image" ? (
                      <label className="field">
                        <span>Image URL</span>
                        <input
                          type="url"
                          value={block.imageUrl ?? ""}
                          onChange={(event) => updateBlock(block.id, { imageUrl: event.target.value })}
                        />
                      </label>
                    ) : null}

                    {block.type === "columns-2" || block.type === "columns-3" ? (
                      <div className="communications-columns-editor">
                        {(block.columns ?? []).map((column, columnIndex) => (
                          <div className="communications-column-editor-card" key={column.id}>
                            <strong>Column {columnIndex + 1}</strong>
                            <label className="field">
                              <span>Heading</span>
                              <input
                                type="text"
                                value={column.heading}
                                onChange={(event) =>
                                  updateColumn(block.id, column.id, { heading: event.target.value })
                                }
                              />
                            </label>
                            <label className="field">
                              <span>Text</span>
                              <textarea
                                className="note-textarea"
                                rows={4}
                                value={column.text}
                                onChange={(event) =>
                                  updateColumn(block.id, column.id, { text: event.target.value })
                                }
                              />
                            </label>
                            <label className="field">
                              <span>Button Label</span>
                              <input
                                type="text"
                                value={column.buttonLabel ?? ""}
                                onChange={(event) =>
                                  updateColumn(block.id, column.id, { buttonLabel: event.target.value })
                                }
                              />
                            </label>
                            <label className="field">
                              <span>Button URL</span>
                              <input
                                type="url"
                                value={column.buttonUrl ?? ""}
                                onChange={(event) =>
                                  updateColumn(block.id, column.id, { buttonUrl: event.target.value })
                                }
                              />
                            </label>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {block.type === "divider" ? (
                      <p className="form-note">A visual divider will be rendered in the preview.</p>
                    ) : null}
                  </article>
                </div>
              ))}

              <div
                className={`communications-drop-indicator ${dropIndex === blocks.length ? "is-visible" : ""}`}
                onDragEnter={(event) => {
                  event.preventDefault();
                  setDropIndex(blocks.length);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDropIndex(blocks.length);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  appendDragItem();
                }}
              >
                <span>Drop block at end</span>
              </div>
            </div>
          ) : (
            <div className={`people-empty-state ${isCanvasDragging ? "communications-drop-target" : ""}`}>
              <h3>No content yet</h3>
              <p>Add blocks from the palette or drag them here to start building the email.</p>
            </div>
          )}
        </section>

        <section className="communications-preview">
          <div className="panel-header">
            <div>
              <h2>Preview</h2>
              <p className="panel-copy">A simple rendering of the current email design.</p>
            </div>
          </div>

          <article className="communications-email-frame">
            <div className="communications-email-header">
              <strong>{campaign.subject}</strong>
              <span>{campaign.preview_text || "No preview text yet."}</span>
            </div>

            <div className="communications-email-body">
              {blocks.map((block) => {
                if (block.type === "heading") {
                  return (
                    <h3 className="communications-block-heading" key={block.id}>
                      {block.content}
                    </h3>
                  );
                }

                if (block.type === "text") {
                  return (
                    <p className="communications-block-text" key={block.id}>
                      {block.content}
                    </p>
                  );
                }

                if (block.type === "button") {
                  return (
                    <a className="communications-block-button" href={block.buttonUrl || "#"} key={block.id}>
                      {block.buttonLabel || "Button"}
                    </a>
                  );
                }

                if (block.type === "image") {
                  return <img alt="" className="communications-block-image" key={block.id} src={block.imageUrl || ""} />;
                }

                if (block.type === "columns-2" || block.type === "columns-3") {
                  return (
                    <div
                      className={`communications-block-columns ${
                        block.type === "columns-3" ? "is-three-columns" : "is-two-columns"
                      }`}
                      key={block.id}
                    >
                      {(block.columns ?? []).map((column) => (
                        <div className="communications-block-column" key={column.id}>
                          <h4>{column.heading}</h4>
                          <p>{column.text}</p>
                          {column.buttonLabel ? (
                            <a className="communications-block-button" href={column.buttonUrl || "#"}>
                              {column.buttonLabel}
                            </a>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  );
                }

                return <hr className="communications-block-divider" key={block.id} />;
              })}
            </div>
          </article>

          <div className="communications-provider-note">
            <strong>Audience</strong>
            <p>
              {recipientSummary.label}: {recipientSummary.count} recipient{recipientSummary.count === 1 ? "" : "s"} with email.
            </p>
          </div>

          <div className="communications-provider-note">
            <strong>Delivery Status</strong>
            <p>Resend is not connected yet, so this designer saves campaigns and preview content only for now.</p>
          </div>
        </section>
      </div>

      <div className="forms-builder-actions">
        <button className="secondary-button" name="intent" type="submit" value="draft">
          Save Draft
        </button>
        <button className="primary-button forms-publish-button" name="intent" type="submit" value="ready">
          Mark Ready
        </button>
      </div>
    </form>
  );
}
