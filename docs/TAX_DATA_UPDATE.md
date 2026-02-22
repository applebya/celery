# Tax Data Update Guide (Celery)

Last verified: 2026-02-04

This document captures the authoritative sources, values, and update steps for the 2026 tax data in Celery. Use it as the single source of truth for future updates.

## Primary Sources (Authoritative)

US (IRS + SSA):
- IRS inflation adjustments and 2026 bracket thresholds + standard deduction: https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill
- IRS Publication 15 (Employer's Tax Guide) for FICA rates: https://www.irs.gov/publications/p15
- IRS Topic 560 for Additional Medicare threshold: https://www.irs.gov/taxtopics/tc560
- SSA OACT COLA page for Social Security wage base: https://www.ssa.gov/oact/cola/cbb.html

Canada (CRA + Revenu Quebec):
- CRA payroll deductions tables (T4032, January 2026): https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4032-payroll-deductions-tables/t4032oc-jan/t4032oc-january-general-information.html
- Revenu Quebec (2026 individual taxation changes, includes QC basic personal amount): https://www.revenuquebec.ca/en/press-room/tax-news/details/2026-01-01/principal-changes-to-the-taxation-of-individuals-for-the-2026-tax-year/

Provincial/Territorial Basic Personal Amounts (CRA T4032)
- Alberta (AB): https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4032-payroll-deductions-tables/t4032ab-jan/t4032ab-january-general-information.html
- British Columbia (BC): https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4032-payroll-deductions-tables/t4032bc-jan/t4032bc-january-general-information.html
- Manitoba (MB): https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4032-payroll-deductions-tables/t4032mb-jan/t4032mb-january-general-information.html
- New Brunswick (NB): https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4032-payroll-deductions-tables/t4032nb-jan/t4032nb-january-general-information.html
- Newfoundland and Labrador (NL): https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4032-payroll-deductions-tables/t4032nl-jan/t4032nl-january-general-information.html
- Nova Scotia (NS): https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4032-payroll-deductions-tables/t4032ns-jan/t4032ns-january-general-information.html
- Northwest Territories (NT): https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4032-payroll-deductions-tables/t4032nt-jan/t4032nt-january-general-information.html
- Nunavut (NU): https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4032-payroll-deductions-tables/t4032nu-jan/t4032nu-january-general-information.html
- Ontario (ON): https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4032-payroll-deductions-tables/t4032on-jan/t4032on-january-general-information.html
- Prince Edward Island (PE): https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4032-payroll-deductions-tables/t4032pe-jan/t4032pe-january-general-information.html
- Saskatchewan (SK): https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4032-payroll-deductions-tables/t4032sk-jan/t4032sk-january-general-information.html
- Yukon (YT): https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4032-payroll-deductions-tables/t4032yt-jan/t4032yt-january-general-information.html

## 2026 Key Values (As Implemented)

US (single filer):
- Standard deduction: 16,100
- Federal brackets (single):
  - 10%: 0 – 12,400
  - 12%: 12,400 – 50,400
  - 22%: 50,400 – 105,700
  - 24%: 105,700 – 201,775
  - 32%: 201,775 – 256,225
  - 35%: 256,225 – 640,600
  - 37%: 640,600+
- Payroll taxes (employee):
  - Social Security: 6.2% up to 184,500
  - Medicare: 1.45% all wages
  - Additional Medicare: 0.9% over 200,000

Canada (federal):
- Brackets:
  - 14%: 0 – 58,523
  - 20.5%: 58,523 – 117,045
  - 26%: 117,045 – 181,440
  - 29%: 181,440 – 258,482
  - 33%: 258,482+
- Basic personal amount (federal): max 16,452, min 14,829 (income-tested)
- Payroll (employee):
  - CPP base + first additional: 5.95% on earnings (income – 3,500) up to YMPE 74,600
  - CPP2: 4.00% on earnings between 74,600 and 85,000
  - EI: 1.63% up to 68,900

Canada provincial/territorial basic personal amounts (2026):
- AB: 22,769
- BC: 13,216
- MB: 15,780
- NB: 13,664
- NL: 11,188
- NS: 11,932
- NT: 18,198
- NU: 19,659
- ON: 12,989
- PE: 15,000
- QC: 18,952
- SK: 20,381
- YT: 16,452

## Annual Update Checklist

1. Update `DATA_YEAR` in `src/data/tax-brackets-YYYY.ts`.
2. US federal brackets and standard deduction:
   - Use IRS annual inflation-adjustment release.
3. US payroll:
   - Use SSA OACT COLA page for wage base.
   - Use IRS Pub 15 for FICA rates and IRS Topic 560 for Additional Medicare threshold.
4. Canada federal brackets and BPA range:
   - Use CRA T4032 (January) general information.
5. Canada payroll (CPP/EI/CPP2):
   - Use CRA T4032 (January) general information.
6. Provincial/territorial BPA:
   - Update from each CRA T4032 provincial/territorial page.
   - QC from Revenu Quebec release.
7. Update tests in `src/lib/tax.test.ts` for expected ranges.
8. Update tooltips that mention the data year.

## Notes

- Regional tax brackets in `src/data/tax-brackets-YYYY.ts` are approximate. Keep “Approx. (YEAR)” tooltips in the UI.
- Canada BPA is applied as a non-refundable tax credit (lowest rate), not a deduction.
- US standard deduction is modeled for single filers only.
