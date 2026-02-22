import { motion } from "framer-motion";
import { useCalculation } from "@/hooks/useCalculation";
import { formatCurrency } from "@/lib/calculate";
import type { SavedScenario } from "@/types";

interface CompareViewProps {
  scenarios: SavedScenario[];
}

// Each card is its own component so hooks are called consistently
// This fixes the "Rendered fewer hooks than expected" error
function ScenarioCard({
  scenario,
  index,
}: {
  scenario: SavedScenario;
  index: number;
}) {
  const calculation = useCalculation(scenario.state);
  const effectiveHourly =
    calculation.billableHours > 0
      ? calculation.netCashAnnual / calculation.billableHours
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative rounded-xl border p-5 transition-all border-border bg-card"
    >
      {/* Scenario name */}
      <h3 className="font-medium text-sm text-muted-foreground mb-4 truncate">
        {scenario.name}
      </h3>

      {/* Take-home (primary) */}
      <div className="mb-4">
        <div className="text-xs text-muted-foreground mb-1">Net cash</div>
        <div className="text-2xl font-semibold tabular-nums">
          {formatCurrency(calculation.netBaseAnnual, scenario.state.currency)}
        </div>
        <div className="text-xs text-muted-foreground">/year after tax</div>
      </div>

      {/* Secondary metrics */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total cash</span>
          <span className="tabular-nums font-medium">
            {formatCurrency(calculation.netCashAnnual, scenario.state.currency)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total comp</span>
          <span className="tabular-nums font-medium">
            {formatCurrency(calculation.totalCompAnnual, scenario.state.currency)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Gross</span>
          <span className="tabular-nums font-medium">
            {formatCurrency(calculation.grossBaseAnnual, scenario.state.currency)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Effective hourly</span>
          <span className="tabular-nums font-medium">
            {formatCurrency(effectiveHourly, scenario.state.currency)}
            /hr
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Hours/year</span>
          <span className="tabular-nums font-medium">
            {calculation.billableHours.toLocaleString()}
          </span>
        </div>
        {scenario.state.showTaxEstimate && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax rate</span>
            <span className="tabular-nums font-medium">
              {(calculation.taxBreakdown.effectiveRate * 100).toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Employment type badge */}
      <div className="mt-4 pt-4 border-t border-border">
        <span className="text-xs text-muted-foreground">
          {scenario.state.employmentType.replace("-", " ")}
        </span>
      </div>
    </motion.div>
  );
}

export function CompareView({ scenarios }: CompareViewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-lg font-medium text-muted-foreground">
          Comparing {scenarios.length} scenarios
        </h2>
      </div>

      {/* Comparison Grid */}
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${Math.min(scenarios.length, 4)}, 1fr)`,
        }}
      >
        {scenarios.map((scenario, index) => (
          <ScenarioCard key={scenario.id} scenario={scenario} index={index} />
        ))}
      </div>
    </div>
  );
}
