import { useState } from "react";
import { Plus, X, Check, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { SavedScenario } from "@/types";
import { Input } from "@/components/ui/input";

interface ScenarioSwitcherProps {
  scenarios: SavedScenario[];
  activeScenarioId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onCreate: () => void;
}

export function ScenarioSwitcher({
  scenarios,
  activeScenarioId,
  onSelect,
  onDelete,
  onRename,
  onCreate,
}: ScenarioSwitcherProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleStartEdit = (scenario: SavedScenario) => {
    setEditingId(scenario.id);
    setEditName(scenario.name);
  };

  const handleSaveEdit = () => {
    if (editingId && editName.trim()) {
      onRename(editingId, editName.trim());
    }
    setEditingId(null);
    setEditName("");
  };

  const handleDelete = (id: string) => {
    // If deleting active scenario, confirm first
    if (id === activeScenarioId) {
      if (confirmDeleteId === id) {
        onDelete(id);
        setConfirmDeleteId(null);
      } else {
        setConfirmDeleteId(id);
        // Auto-clear after 3 seconds
        setTimeout(() => setConfirmDeleteId(null), 3000);
      }
    } else {
      onDelete(id);
    }
  };

  if (scenarios.length === 0) {
    return null; // Don't show switcher until there are scenarios
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <AnimatePresence mode="popLayout">
        {scenarios.map((scenario) => {
          const isActive = scenario.id === activeScenarioId;
          const isEditing = editingId === scenario.id;
          const isConfirmingDelete = confirmDeleteId === scenario.id;

          return (
            <motion.div
              key={scenario.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="relative group"
            >
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveEdit();
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="h-8 w-40 text-sm"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveEdit}
                    className="p-1.5 rounded-md hover:bg-muted"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onSelect(scenario.id)}
                    onDoubleClick={() => handleStartEdit(scenario)}
                    className={`
                    relative px-3 py-1.5 text-sm rounded-full transition-all duration-150
                    ${
                      isActive
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-md"
                        : "bg-muted/50 hover:bg-muted border border-border/50 hover:border-border"
                    }
                  `}
                  >
                    {scenario.name}
                  </button>
                  {isActive && (
                    <button
                      onClick={() => handleStartEdit(scenario)}
                      className="p-1 rounded-md opacity-50 hover:opacity-100 hover:bg-muted transition-opacity"
                      title="Rename"
                      aria-label="Rename scenario"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                  )}
                </div>
              )}

              {/* Delete button - appears on hover */}
              {!isEditing && scenarios.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(scenario.id);
                  }}
                  className={`
                    absolute -top-1 -right-1 p-1 rounded-full
                    transition-all duration-150
                    ${
                      isConfirmingDelete
                        ? "bg-destructive text-destructive-foreground opacity-100"
                        : "bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100"
                    }
                  `}
                  title={
                    isConfirmingDelete
                      ? "Click again to confirm"
                      : "Delete scenario"
                  }
                  aria-label={
                    isConfirmingDelete
                      ? "Click again to confirm delete"
                      : "Delete scenario"
                  }
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Add scenario button */}
      <motion.button
        layout
        onClick={onCreate}
        className="flex items-center gap-1 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-full border border-dashed border-border hover:border-foreground/50 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
      >
        <Plus className="h-3.5 w-3.5" />
        Add
      </motion.button>
    </div>
  );
}
