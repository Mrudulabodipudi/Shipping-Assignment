# Shipping Bill Refactoring — Frontend Engineering Assignment

**Role:** Frontend Engineer  
**Starter Repository Refactored:** `https://github.com/Bharat-Aaj-Kal/assignment-01`  
**Submission Target:** GitHub User `shivamkj` · Email: `shivam@aajkalbharat.com`  

---

## 1. Executive Summary & Problem Analysis

The starter application was an internal customs software tool for creating and managing Indian Customs **Shipping Bills (ICEGATE EDI declarations)**. The initial codebase suffered from key structural deficiencies:

1. **Monolithic 1,760-Line Component (`shipping-bill-form.tsx`):** All responsibilities—party selects, form state, complex customs line item tables, calculations, tab switching, and inline modal state—were combined into one single file.
2. **Hardcoded Array Coupling in UI:** Components directly imported raw master datasets (`quantityCodes`, `schemeCodes`, `stateOptions`, `Trades`) and invoked synchronous `getDemoData()`, violating clean architecture principles and preventing backend integration.
3. **Fragile Submodule Dependency (`fe-zen-arch`):** The repository was coupled to an external, private Git submodule with custom form wrappers that caused build fragility and poor maintainability.
4. **Scattered Domain Calculations & Incomplete Validations:** Invoice totals, weight sanity checks, mutual exclusivity of freight rates vs amounts, and drawback eligibility were either duplicated or missing safety validations.
5. **No Dependency Additions:** Refactored without introducing new external packages (using existing React 19, Tailwind CSS v4, Lucide React, and TypeScript).

---

## 2. Refactored Architecture & Separation of Concerns

The solution decomposes the frontend into four strictly decoupled layers:

```
┌─────────────────────────────────────────────────────────────────┐
│                    1. Presentation / UI Layer                   │
│   ShippingBillList · ShippingBillForm · ShipmentBasicsStep     │
│       InvoicesStep · InvoiceCard · GoodsItemEditor · OthersStep  │
│         AsyncSelect · Button · Input · Select · Modal · Card     │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                     2. Custom State & Hooks                     │
│       useShippingBill (Form state, multi-step, auto-save)       │
│       useMasterData   (Async options caching & loading)        │
│       usePartySearch  (Debounced query & branch resolution)     │
│       useDebounce     (Input throttling)                        │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                  3. Pure Domain & Business Logic                │
│       calculations.ts  (Line totals, invoice totals, FOB)       │
│       validations.ts   (Step-by-step & cross-field rules)       │
│       icegateFlatFile.ts (ICEGATE EDI .sb format generator)     │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                 4. Asynchronous API Services Layer               │
│       masterDataService  (Ports, UQCs, Schemes, States, Trades) │
│       partyService       (Exporters, Consignees, Buyers, Br.)   │
│       shippingBillService(List, Get, Upsert, Delete, FlatFile)   │
│       marksAndNumbersService (Exporter-specific marks)          │
│       apiClient          (Promise executor & latency simulator) │
│       mockStorage        (LocalStorage & in-memory repository)  │
└─────────────────────────────────────────────────────────────────┘
```

### Key Architectural Highlights:
- **Clean Component Responsibilities:**
  - `ShipmentBasicsStep.tsx`: Handles parties, branches, loading and destination ports, route exceptions, and packaging details.
  - `InvoicesStep.tsx` & `InvoiceCard.tsx`: Manages commercial invoices, currency, incoterms, and financial adjustments.
  - `GoodsItemEditor.tsx`: Manages RITC/HS code classification, unit rates, quantity, drawback schedules, and IGST refund routes.
  - `OthersStep.tsx`: Consolidates container tracking, packing number sequences, e-SANCHIT digital documents, and DGFT export licences.
- **Zero Mock Imports in UI:** No component imports hardcoded data arrays. Everything flows through asynchronous, Promise-returning service contracts.
- **Pluggable HTTP Backend Ready:** Switching from mock simulation to a production REST/GraphQL backend requires modifying only the service layer (`src/services/api/*`), leaving all UI components untouched.

---

## 3. Asynchronous Mock Services (Promise-Based)

All data access is mediated through Promise-based services:

| Service | Asynchronous Methods | Simulates |
| :--- | :--- | :--- |
| `masterDataService` | `searchLoadingPorts()`, `searchDestinationPorts()`, `getStates()`, `getQuantityCodes()`, `getSchemeCodes()`, `getDocumentCodes()`, `getCurrencies()`, `getContractTypes()` | Master customs reference data endpoints with search filtering and latency. |
| `partyService` | `searchExporters()`, `searchExporterBranches()`, `searchConsignees()`, `searchBuyers()`, `createExporter()`, `createBusiness()`, `createBranch()` | Master entity & CRM lookup with debounce, entity creation, and branch linking. |
| `shippingBillService` | `list()`, `getById()`, `save()`, `delete()`, `validate()`, `generateFlatFile()`, `downloadFlatFile()` | Core Shipping Bill CRUD, draft auto-saving, pre-filing validation, and EDI file exports. |
| `marksAndNumbersService` | `getMarksAndNumbersOptions(exporterId)`, `addMarksAndNumbersOption()` | Dynamic loading of shipping marks registered to a specific exporter. |
| `apiClient` | `execute<T>(operation, options)` | Realistic network simulation (150ms delay, optional error simulation, request logging). |

Each asynchronous interaction supports:
- **Loading State:** Visual spinners (`Loader2`) on search selects and buttons.
- **Empty State:** Helpful UI feedback when searches return no matching results.
- **Error State:** Non-blocking error handling with notifications (`useToast`).

---

## 4. Customs & Shipping Bill Domain Rules Handled

1. **Port of Loading vs. Destination Port:**
   - Loading port enforces Indian customs locations (`INMUN1` Mundra, `INNSA1` Nhava Sheva, `INMAA1` Chennai, etc.).
   - Destination port auto-derives the target foreign country name based on UN/LOCODE prefixes.
2. **Gross Weight vs. Net Weight Sanity:**
   - Displays a customs regulatory warning if Net Weight exceeds Gross Weight (since gross must account for tare and packaging).
3. **Financial Rate vs. Amount Mutual Exclusivity:**
   - For Freight, Insurance, Commission, Discount, and Other Deductions: entering a Rate % locks the Amount input; entering an Amount locks the Rate % input.
   - Currency defaults to the Invoice Currency unless overridden.
4. **Duty Drawback / RoDTEP / RoSCTL Incentive Visibility:**
   - When a selected Export Scheme Code (e.g., Code `19` Drawback) is eligible for incentives, the form automatically reveals Drawback Schedule Serial Number, Drawback Unit, and Drawback Quantity.
5. **IGST Payment Routes:**
   - Selecting **Against Payment of IGST ('P')** dynamically reveals Taxable Assessable Value and IGST Paid fields required for customs GST refunds.
   - Selecting **LUT / Bond ('LUT')** suppresses unnecessary tax fields.
6. **Buyer vs. Consignee Disconnect:**
   - Checking "Buyer is same as Consignee" automatically copies and synchronizes the overseas entity.
   - Unchecking it enables independent party selection and branch address assignment.
7. **Official ICEGATE EDI Flat File (.sb) Generation:**
   - Generates fully compliant EDI flat files matching the official format:
     - `HREC`: Header record with port code and ICEGATE protocol tag.
     - `<TABLE>SHIPPING_BILL`: Header records (CHA, Job date, Exporter, Consignee, Ports, Cargo, Weights).
     - `<TABLE>INVOICE`: Commercial invoice numbers, currencies, incoterms, freight, insurance.
     - `<TABLE>ITEM`: Item serial, RITC/HS code, descriptions, quantity, UOM, unit prices, line totals, scheme codes.
     - `<TABLE>PACKING`: Serial packing ranges (from/to package numbers and packaging codes).
     - `<TABLE>SUPPORTING_DOCS`: e-SANCHIT document codes and Image Reference Numbers (IRN).
     - `<TABLE>LICENCE`: DGFT registration numbers, validity, and export quotas.
     - `TREC`: Trailer record.
   - Includes direct browser download (`.sb` extension).

---

## 5. AI Usage & Approach

### Tools Used
- **Google AI Studio Build & Modern LLM Coding Engine:** Used for architectural analysis, domain knowledge extraction from the starter repository, and schema normalization.

### How They Were Used
- **Codebase Auditing:** Audited the original 1,760-line starter code, identifying hidden couplings, proprietary submodule dependencies, and duplicated state calculations.
- **Domain Modeling:** Extracted Indian Customs ICEGATE rules, UN/LOCODE mappings, and e-SANCHIT document structures into clean TypeScript definitions.
- **Service Boundary Design:** Created typed asynchronous contracts with realistic delays to simulate production backend services.

### Additional Workflows
- Built test runs verifying zero TypeScript errors via `npx tsc --noEmit`.
- Tested form interactions including adding/removing invoices, line items, containers, e-SANCHIT documents, and downloading the ICEGATE flat file.

### Engineering Judgment Applied
- **Eliminated Proprietary Submodules:** Instead of fighting with the missing SSH key in `git@github.com:shivamkj/fe-zen-arch.git`, re-implemented a clean, accessible React 19 component library using standard Tailwind CSS and Lucide icons.
- **Pragmatic Refactoring over Large Rewrites:** Preserved the exact data model and ICEGATE flat file serialization format while completely modernizing the state flow, component hierarchy, and service abstraction.
- **Strict Dependency Discipline:** Respected the assignment constraint: **No new dependencies added**.

### Learnings and Validation
- Clean architecture significantly reduces form rendering overhead: isolating line item inputs into `GoodsItemEditor` prevents re-rendering the entire 1,700-line tree on every keystroke.
- Separation of calculation functions into pure modules (`src/domain/calculations.ts`) makes domain logic straightforward to unit test and verify.

---

## 6. How to Run the Project

```bash
# 1. Install dependencies (already pre-installed)
npm install

# 2. Start the development server
npm run dev

# 3. Type check
npx tsc --noEmit

# 4. Production build
npm run build
```
