import { test, expect, Page } from "@playwright/test";

// Helper: seed localStorage to skip onboarding and set up a clean scenario
async function setupCalculator(
  page: Page,
  overrides?: Record<string, unknown>,
) {
  await page.addInitScript((state) => {
    localStorage.setItem("celery-location-confirmed", "true");
    const defaultScenario = {
      id: "test-1",
      name: "Test Scenario",
      state: {
        title: "",
        hourlyRate: 50,
        currency: "USD",
        country: "US",
        region: "CA",
        holidaysPerYear: 10,
        ptoDays: 0,
        sickDays: 0,
        hoursPerDay: 8,
        daysPerWeek: 5,
        showTaxEstimate: true,
        isSelfEmployed: true,
        calculationMode: "hourlyToSalary",
        targetSalary: 150000,
        unlimitedPTO: false,
        traderMargin: 0,
        displayCurrency: "USD",
        showCurrencyConversion: true,
        employmentType: "contractor-hourly",
        monthlyRetainer: 10000,
        expectedHoursMin: 120,
        expectedHoursMax: 160,
        useFixedMonthlyHours: false,
        fixedMonthlyHours: 160,
        annualBonus: 0,
        signOnBonus: 0,
        signOnYears: 1,
        stipendAnnual: 0,
        employerMatchAnnual: 0,
        equityMode: "annual",
        equityAnnualValue: 0,
        equityGrantValue: 0,
        equityVestYears: 4,
        equityCliffMonths: 12,
        extrasTaxTreatment: {
          bonus: "taxable",
          signOn: "taxable",
          stipend: "nonTaxable",
          match: "nonCash",
          equity: "nonCash",
        },
        ...state,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    localStorage.setItem("celery-scenarios", JSON.stringify([defaultScenario]));
  }, overrides ?? {});
  await page.goto("/");
}

// Helper: assert no NaN or Infinity text visible anywhere on the page
async function assertNoNaN(page: Page) {
  const bodyText = await page.locator("body").textContent();
  expect(bodyText).not.toContain("NaN");
  expect(bodyText).not.toContain("Infinity");
  expect(bodyText).not.toContain("undefined");
}

test.describe("No NaN in calculator outputs", () => {
  test("contractor hourly with fixed monthly hours", async ({ page }) => {
    await setupCalculator(page, {
      useFixedMonthlyHours: true,
      fixedMonthlyHours: 160,
      hourlyRate: 75,
    });
    await assertNoNaN(page);
    await expect(page.getByText(/\$[\d,]+.*\/year/).first()).toBeVisible();
  });

  test("contractor hourly with standard schedule", async ({ page }) => {
    await setupCalculator(page, {
      hourlyRate: 100,
      hoursPerDay: 8,
      daysPerWeek: 5,
    });
    await assertNoNaN(page);
  });

  test("employee salary mode", async ({ page }) => {
    await setupCalculator(page, {
      employmentType: "employee-salary",
      calculationMode: "salaryToHourly",
      targetSalary: 120000,
      isSelfEmployed: false,
    });
    await assertNoNaN(page);
  });

  test("contractor retainer mode", async ({ page }) => {
    await setupCalculator(page, {
      employmentType: "contractor-retainer",
      monthlyRetainer: 12000,
      expectedHoursMin: 100,
      expectedHoursMax: 160,
    });
    await assertNoNaN(page);
  });

  test("Other country (no tax)", async ({ page }) => {
    await setupCalculator(page, {
      country: "OTHER",
      region: "",
      currency: "EUR",
      hourlyRate: 60,
    });
    await assertNoNaN(page);
  });

  test("Canada with provinces", async ({ page }) => {
    await setupCalculator(page, {
      country: "CA",
      region: "ON",
      currency: "CAD",
      hourlyRate: 80,
    });
    await assertNoNaN(page);
  });

  test("currency conversion (job currency differs from home)", async ({
    page,
  }) => {
    await setupCalculator(page, {
      country: "US",
      region: "CA",
      currency: "CAD",
      hourlyRate: 75,
      traderMargin: 2.5,
    });
    await assertNoNaN(page);
  });

  test("zero hourly rate does not produce NaN", async ({ page }) => {
    await setupCalculator(page, { hourlyRate: 0 });
    await assertNoNaN(page);
  });

  test("zero fixed monthly hours falls back gracefully", async ({ page }) => {
    await setupCalculator(page, {
      useFixedMonthlyHours: true,
      fixedMonthlyHours: 0,
    });
    await assertNoNaN(page);
  });

  test("extras with all categories populated", async ({ page }) => {
    await setupCalculator(page, {
      hourlyRate: 100,
      annualBonus: 15000,
      signOnBonus: 20000,
      signOnYears: 2,
      stipendAnnual: 5000,
      employerMatchAnnual: 8000,
      equityMode: "vesting",
      equityGrantValue: 100000,
      equityVestYears: 4,
    });
    await assertNoNaN(page);
  });

  test("fixed monthly hours with currency conversion", async ({ page }) => {
    await setupCalculator(page, {
      useFixedMonthlyHours: true,
      fixedMonthlyHours: 160,
      hourlyRate: 75,
      country: "CA",
      region: "ON",
      currency: "USD",
      traderMargin: 3,
    });
    await assertNoNaN(page);
  });
});

test.describe("Main calculator flows", () => {
  test("onboarding flow completes and shows calculator", async ({ page }) => {
    // Fresh state — no localStorage
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /get started/i }),
    ).toBeVisible();
    await page.getByRole("button", { name: /Calculate My Salary/i }).click();

    // Calculator should now be visible
    await expect(page.getByText(/Gross/i)).toBeVisible();
    await assertNoNaN(page);
  });

  test("changing hourly rate updates results without NaN", async ({ page }) => {
    await setupCalculator(page);
    const input = page.locator('input[type="number"]').first();

    // Clear and type new value
    await input.click();
    await input.fill("125");

    await assertNoNaN(page);
    await expect(page.getByText(/\$[\d,]+/).first()).toBeVisible();
  });

  test("toggling fixed monthly hours on/off", async ({ page }) => {
    await setupCalculator(page);

    // Open work schedule section
    await page.getByRole("button", { name: /Work schedule/i }).click();

    // Enable fixed monthly hours
    await page.getByRole("switch", { name: /Fixed monthly hours/i }).click();

    await assertNoNaN(page);

    // Should show the fixed hours input
    await expect(page.getByText(/Hours per month/i)).toBeVisible();

    // Disable fixed monthly hours
    await page.getByRole("switch", { name: /Fixed monthly hours/i }).click();
    await assertNoNaN(page);

    // Should show standard schedule inputs
    await expect(page.getByText(/Hours\/day/i)).toBeVisible();
  });

  test("editing fixed monthly hours input", async ({ page }) => {
    await setupCalculator(page, { useFixedMonthlyHours: true });

    // Open work schedule section
    await page.getByRole("button", { name: /Work schedule/i }).click();

    const hoursInput = page
      .getByRole("spinbutton")
      .filter({ has: page.locator('[value="160"]') });

    // Change to different value
    if (await hoursInput.isVisible()) {
      await hoursInput.click();
      await hoursInput.fill("120");
      await assertNoNaN(page);
    }
  });

  test("switching employment types", async ({ page }) => {
    await setupCalculator(page);

    // Switch to Retainer
    await page.getByRole("button", { name: "Retainer" }).click();
    await assertNoNaN(page);

    // Switch to Employee
    await page.getByRole("button", { name: "Employee" }).click();
    await assertNoNaN(page);

    // Switch to Salary
    await page.getByRole("button", { name: "Salary" }).click();
    await assertNoNaN(page);

    // Switch back to Contractor
    await page.getByRole("button", { name: "Contractor" }).click();
    await assertNoNaN(page);
  });

  test("switching countries", async ({ page }) => {
    await setupCalculator(page);

    // Find the country combobox (first one in the "My location" section)
    const locationSection = page.getByText("My location").locator("..");
    const countryCombobox = locationSection.getByRole("combobox").first();

    // Switch to Canada
    await countryCombobox.click();
    await page.getByRole("option", { name: /Canada/i }).click();
    await assertNoNaN(page);

    // Switch to Other
    await countryCombobox.click();
    await page.getByRole("option", { name: /Other/i }).click();
    await assertNoNaN(page);

    // Switch to US
    await countryCombobox.click();
    await page.getByRole("option", { name: /United States/i }).click();
    await assertNoNaN(page);
  });

  test("period breakdown shows valid values", async ({ page }) => {
    await setupCalculator(page, { hourlyRate: 50 });

    // Check breakdown section is present with valid labels
    await expect(page.getByText("Breakdown")).toBeVisible();
    await expect(page.getByText("Monthly")).toBeVisible();
    await expect(page.getByText("Weekly", { exact: true })).toBeVisible();
    await expect(page.getByText("Daily")).toBeVisible();
    await assertNoNaN(page);
  });

  test("compare view shows valid values", async ({ page }) => {
    // Set up two scenarios
    await page.addInitScript(() => {
      localStorage.setItem("celery-location-confirmed", "true");
      const baseState = {
        title: "",
        hourlyRate: 50,
        currency: "USD",
        country: "US",
        region: "CA",
        holidaysPerYear: 10,
        ptoDays: 0,
        sickDays: 0,
        hoursPerDay: 8,
        daysPerWeek: 5,
        showTaxEstimate: true,
        isSelfEmployed: true,
        calculationMode: "hourlyToSalary",
        targetSalary: 150000,
        unlimitedPTO: false,
        traderMargin: 0,
        displayCurrency: "USD",
        showCurrencyConversion: true,
        employmentType: "contractor-hourly",
        monthlyRetainer: 10000,
        expectedHoursMin: 120,
        expectedHoursMax: 160,
        useFixedMonthlyHours: false,
        fixedMonthlyHours: 160,
        annualBonus: 0,
        signOnBonus: 0,
        signOnYears: 1,
        stipendAnnual: 0,
        employerMatchAnnual: 0,
        equityMode: "annual",
        equityAnnualValue: 0,
        equityGrantValue: 0,
        equityVestYears: 4,
        equityCliffMonths: 12,
        extrasTaxTreatment: {
          bonus: "taxable",
          signOn: "taxable",
          stipend: "nonTaxable",
          match: "nonCash",
          equity: "nonCash",
        },
      };
      const scenarios = [
        {
          id: "s1",
          name: "Job A",
          state: { ...baseState, hourlyRate: 50 },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: "s2",
          name: "Job B",
          state: { ...baseState, hourlyRate: 75 },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];
      localStorage.setItem("celery-scenarios", JSON.stringify(scenarios));
    });
    await page.goto("/");

    // Click compare button (exact match to avoid FAQ "How do I compare" button)
    const compareBtn = page.getByRole("button", {
      name: "Compare",
      exact: true,
    });
    await compareBtn.click();

    await expect(page.getByText(/Comparing 2 scenarios/i)).toBeVisible();
    await assertNoNaN(page);
  });

  test("corrupt localStorage numeric values are sanitized", async ({
    page,
  }) => {
    // Seed with intentionally corrupt numeric values
    await page.addInitScript(() => {
      localStorage.setItem("celery-location-confirmed", "true");
      const corruptScenario = {
        id: "corrupt-1",
        name: "Corrupt Data",
        state: {
          title: "",
          hourlyRate: NaN,
          currency: "USD",
          country: "US",
          region: "CA",
          holidaysPerYear: NaN,
          ptoDays: NaN,
          sickDays: 0,
          hoursPerDay: NaN,
          daysPerWeek: NaN,
          showTaxEstimate: true,
          isSelfEmployed: true,
          calculationMode: "hourlyToSalary",
          targetSalary: NaN,
          unlimitedPTO: false,
          traderMargin: NaN,
          displayCurrency: "USD",
          showCurrencyConversion: true,
          employmentType: "contractor-hourly",
          monthlyRetainer: 10000,
          expectedHoursMin: 120,
          expectedHoursMax: 160,
          useFixedMonthlyHours: true,
          fixedMonthlyHours: NaN,
          annualBonus: 0,
          signOnBonus: 0,
          signOnYears: 1,
          stipendAnnual: 0,
          employerMatchAnnual: 0,
          equityMode: "annual",
          equityAnnualValue: 0,
          equityGrantValue: 0,
          equityVestYears: 4,
          equityCliffMonths: 12,
          extrasTaxTreatment: {
            bonus: "taxable",
            signOn: "taxable",
            stipend: "nonTaxable",
            match: "nonCash",
            equity: "nonCash",
          },
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      localStorage.setItem(
        "celery-scenarios",
        JSON.stringify([corruptScenario]),
      );
    });
    await page.goto("/");

    // Should recover gracefully — no NaN on screen
    await assertNoNaN(page);
    await expect(page.getByText(/Gross/i)).toBeVisible();
  });
});
