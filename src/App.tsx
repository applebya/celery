import { useState, useEffect, useCallback, useRef } from "react";
import { Calculator } from "@/components/Calculator";
import { CompareView } from "@/components/CompareView";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FooterContent } from "@/components/FooterContent";
import { useScenarios } from "@/hooks/useScenarios";
import { useTheme } from "@/hooks/useTheme";
import { DEFAULT_STATE, type CalculatorState } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Plus, X, BarChart3, MapPin } from "lucide-react";
import { countries, getCountry, getHolidayCount } from "@/data/holidays-2026";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Legacy storage keys for migration
const LEGACY_STORAGE_KEY_LEFT = "celery-calculator-left";
const LEGACY_STORAGE_KEY_RIGHT = "celery-calculator-right";

type ViewMode = "calculator" | "compare";

// Detect country from browser locale
function detectCountryFromLocale(): "CA" | "US" {
  try {
    const locale = navigator.language || "en-US";
    const regionCode = locale.split("-")[1]?.toUpperCase();
    if (regionCode === "CA") return "CA";
  } catch {
    // Fall back to US
  }
  return "US";
}

function App() {
  // Initialize theme early so it applies to all screens including onboarding
  useTheme();

  const {
    scenarios,
    activeScenarioId,
    setActiveScenarioId,
    createScenario,
    deleteScenario,
    renameScenario,
    updateActiveScenario,
    getActiveScenario,
    updateAllScenarios,
  } = useScenarios();

  const [viewMode, setViewMode] = useState<ViewMode>("calculator");
  const [hasAutoDetected, setHasAutoDetected] = useState(false);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [locationConfirmed, setLocationConfirmed] = useState(() => {
    return localStorage.getItem("celery-location-confirmed") === "true";
  });

  // Auto-save indicator
  const [showSaved, setShowSaved] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Migrate legacy data on first load, or create default scenarios
  useEffect(() => {
    if (scenarios.length === 0) {
      const legacyLeft = localStorage.getItem(LEGACY_STORAGE_KEY_LEFT);
      if (legacyLeft) {
        try {
          const state = JSON.parse(legacyLeft) as CalculatorState;
          createScenario(state); // "Current Job" with legacy data
          createScenario(); // "New Job" with defaults
          localStorage.removeItem(LEGACY_STORAGE_KEY_LEFT);
          localStorage.removeItem(LEGACY_STORAGE_KEY_RIGHT);
        } catch {
          createScenario(); // "Current Job"
          createScenario(); // "New Job"
        }
      } else {
        createScenario(); // "Current Job"
        createScenario(); // "New Job"
      }
    }
  }, [scenarios.length, createScenario]);

  // Auto-detect location from browser locale on first load
  useEffect(() => {
    if (!hasAutoDetected && scenarios.length > 0) {
      const detectedCountry = detectCountryFromLocale();
      const activeState = getActiveScenario()?.state;
      // Only auto-detect if still on defaults
      if (activeState && activeState.country !== detectedCountry) {
        const defaultRegion = detectedCountry === "CA" ? "ON" : "CA";
        const countryData = getCountry(detectedCountry);
        const holidays = getHolidayCount(detectedCountry, defaultRegion);
        updateAllScenarios({
          country: detectedCountry,
          region: defaultRegion,
          currency:
            countryData?.currency ?? (detectedCountry === "CA" ? "CAD" : "USD"),
          holidaysPerYear: holidays,
        });
      }
      setHasAutoDetected(true);
    }
  }, [
    hasAutoDetected,
    scenarios.length,
    getActiveScenario,
    updateAllScenarios,
  ]);

  // Get current state from active scenario
  const activeScenario = getActiveScenario();
  const currentState = activeScenario?.state ?? DEFAULT_STATE;

  // Debounced auto-save handler
  const handleStateChange = useCallback(
    (newState: CalculatorState) => {
      updateActiveScenario(newState);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        setShowSaved(true);

        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
          setShowSaved(false);
        }, 1500);
      }, 1000);
    },
    [updateActiveScenario],
  );

  const handleSelectScenario = useCallback(
    (id: string) => {
      setActiveScenarioId(id);
      setViewMode("calculator");
    },
    [setActiveScenarioId],
  );

  const handleCreateScenario = useCallback(() => {
    const newId = createScenario();
    // Auto-enter edit mode for the new tab
    const jobLetter = String.fromCharCode(65 + scenarios.length);
    setEditingTabId(newId);
    setEditingName(`Job ${jobLetter}`);
  }, [createScenario, scenarios.length]);

  const handleDeleteScenario = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (scenarios.length > 1) {
        deleteScenario(id);
      }
    },
    [deleteScenario, scenarios.length],
  );

  // Location change handlers (updates all scenarios)
  const handleCountryChange = useCallback(
    (country: "CA" | "US" | "MX") => {
      const countryData = getCountry(country);
      // Default regions: CA=Ontario, US=California, MX=Mexico City
      const defaultRegion =
        country === "CA" ? "ON" : country === "MX" ? "CDMX" : "CA";
      const holidays = getHolidayCount(country, defaultRegion);
      updateAllScenarios({
        country,
        region: defaultRegion,
        currency: countryData?.currency ?? (country === "MX" ? "MXN" : "CAD"),
        holidaysPerYear: holidays,
      });
    },
    [updateAllScenarios],
  );

  const handleRegionChange = useCallback(
    (region: string) => {
      const holidays = getHolidayCount(currentState.country, region);
      updateAllScenarios({ region, holidaysPerYear: holidays });
    },
    [currentState.country, updateAllScenarios],
  );

  const handleConfirmLocation = useCallback(() => {
    localStorage.setItem("celery-location-confirmed", "true");
    setLocationConfirmed(true);
  }, []);

  const currentCountry = getCountry(currentState.country);
  const canCompare = scenarios.length >= 2;

  // Show location confirmation screen for first-time users
  if (!locationConfirmed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-8"
        >
          <div className="space-y-4">
            <img
              src="/logo.png"
              alt="Celery logo"
              className="h-16 w-auto mx-auto"
            />
            <h1 className="text-3xl font-semibold tracking-tight">Celery</h1>
            <p className="text-muted-foreground">The Salary Calculator</p>
          </div>

          <div className="bg-card border rounded-xl p-6 space-y-6 text-left">
            <div className="space-y-2">
              <h2 className="text-lg font-medium">Let's get started</h2>
              <p className="text-sm text-muted-foreground">
                First, tell us where you pay taxes so we can estimate your
                take-home pay with the correct 2026 tax brackets.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Country</label>
                <Select
                  value={currentState.country}
                  onValueChange={handleCountryChange}
                >
                  <SelectTrigger className="w-full" aria-label="Select country">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.flag} {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Hide region dropdown for Mexico (same tax rate across states) */}
              {currentState.country !== "MX" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {currentState.country === "CA" ? "Province" : "State"}
                  </label>
                  <Select
                    value={currentState.region}
                    onValueChange={handleRegionChange}
                  >
                    <SelectTrigger
                      className="w-full"
                      aria-label={`Select ${currentState.country === "CA" ? "province" : "state"}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currentCountry?.regions.map((r) => (
                        <SelectItem key={r.code} value={r.code}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <button
              onClick={handleConfirmLocation}
              className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Calculate My Salary →
            </button>
          </div>

          <p className="text-xs text-muted-foreground">
            Your data stays on your device. Nothing is sent to any server.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Celery logo" className="h-8 w-auto" />
            <h1 className="text-xl font-semibold tracking-tight">Celery</h1>
            <span className="text-sm text-muted-foreground hidden sm:inline mt-0.5">
              The Salary Calculator
            </span>
          </div>
          <div className="flex items-center gap-3">
            <AnimatePresence>
              {showSaved && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-1 text-xs text-primary"
                >
                  <Check className="h-3 w-3" />
                  Saved
                </motion.div>
              )}
            </AnimatePresence>
            <ThemeToggle />
          </div>
        </header>

        {/* Tab Navigation */}
        <nav className="mb-6">
          <div className="flex items-center gap-1 border-b border-border">
            {/* Scenario tabs */}
            {scenarios.map((scenario, index) => {
              const isActive =
                scenario.id === activeScenarioId && viewMode === "calculator";
              const isEditing = editingTabId === scenario.id;
              const displayName =
                scenario.name || `Job ${String.fromCharCode(65 + index)}`;

              return (
                <div
                  key={scenario.id}
                  className={`
                    group relative px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer
                    ${
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }
                  `}
                  onClick={() => handleSelectScenario(scenario.id)}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setEditingTabId(scenario.id);
                    setEditingName(displayName);
                  }}
                  title={displayName}
                >
                  {isEditing ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={() => {
                        if (editingName.trim()) {
                          renameScenario(scenario.id, editingName.trim());
                        }
                        setEditingTabId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          if (editingName.trim()) {
                            renameScenario(scenario.id, editingName.trim());
                          }
                          setEditingTabId(null);
                        } else if (e.key === "Escape") {
                          setEditingTabId(null);
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                      className="bg-transparent border-b border-primary outline-none w-full max-w-[200px]"
                    />
                  ) : (
                    <span className="truncate max-w-[200px]">
                      {displayName}
                    </span>
                  )}
                  {/* Delete button - absolutely positioned top-right on hover */}
                  {scenarios.length > 1 && !isEditing && (
                    <button
                      onClick={(e) => handleDeleteScenario(scenario.id, e)}
                      className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 p-0.5 rounded-full bg-muted hover:bg-destructive/20 hover:text-destructive transition-all"
                      aria-label="Delete scenario"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                </div>
              );
            })}

            {/* Add tab button */}
            <button
              onClick={handleCreateScenario}
              className="flex items-center gap-1 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Add scenario"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add</span>
            </button>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Location selector */}
            <div className="flex items-center gap-2 px-3 py-1.5 border-b-2 border-transparent">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground hidden sm:inline">
                My location
              </span>
              <Select
                value={currentState.country}
                onValueChange={handleCountryChange}
              >
                <SelectTrigger className="h-7 w-[145px] text-xs border-0 bg-transparent px-2 focus:ring-0 focus:ring-offset-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.flag} {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Hide region dropdown for Mexico (same tax rate across states) */}
              {currentState.country !== "MX" && (
                <Select
                  value={currentState.region}
                  onValueChange={handleRegionChange}
                >
                  <SelectTrigger className="h-7 w-[110px] text-xs border-0 bg-transparent px-2 focus:ring-0 focus:ring-offset-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currentCountry?.regions.map((r) => (
                      <SelectItem key={r.code} value={r.code}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Compare tab */}
            {canCompare && (
              <button
                onClick={() => setViewMode("compare")}
                className={`
                  relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors
                  ${
                    viewMode === "compare"
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Compare</span>
                {viewMode === "compare" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            )}
          </div>
        </nav>

        {/* Main Content */}
        <main>
          <AnimatePresence mode="wait">
            {viewMode === "calculator" ? (
              <motion.div
                key="calculator"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <Calculator
                  state={currentState}
                  onChange={handleStateChange}
                  onRename={(name) => {
                    if (activeScenarioId) {
                      renameScenario(activeScenarioId, name);
                    }
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="compare"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <CompareView scenarios={scenarios} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <FooterContent />
        <footer className="text-center mt-8 pb-4 text-[10px] text-muted-foreground">
          <p>2026 tax rates · Estimates only · Saved locally</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
