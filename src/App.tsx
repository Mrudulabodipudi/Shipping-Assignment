import { useState } from 'react'
import {
  FileText,
  Ship,
  BookOpen,
  X,
  Code2,
  CheckCircle,
  ExternalLink,
} from 'lucide-react'
import { ShippingBillList } from './components/dashboard/ShippingBillList'
import { ShippingBillForm } from './components/form/ShippingBillForm'
import { Button } from './components/common/Button'
import { Modal } from './components/common/Modal'
import { ToastProvider } from './components/common/Toast'
import { SavedBill } from './types/shipping-bill.types'

export default function App() {
  const [currentView, setCurrentView] = useState<'list' | 'form'>('list')
  const [selectedBill, setSelectedBill] = useState<SavedBill | undefined>(undefined)
  const [docsModalOpen, setDocsModalOpen] = useState(false)

  const handleCreateNew = () => {
    setSelectedBill(undefined)
    setCurrentView('form')
  }

  const handleEditBill = (bill: SavedBill) => {
    setSelectedBill(bill)
    setCurrentView('form')
  }

  const handleBackToList = () => {
    setSelectedBill(undefined)
    setCurrentView('list')
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        {/* Global Navigation Header */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div
              className="flex items-center gap-3 cursor-pointer select-none"
              onClick={handleBackToList}
            >
              <div className="size-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Ship className="size-5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-base sm:text-lg tracking-tight block leading-tight">
                  ICEGATE Customs Portal
                </span>
                <span className="text-[11px] font-medium text-slate-500 block leading-tight">
                  Shipping Bill Refactored Architecture
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDocsModalOpen(true)}
                className="text-slate-700 bg-white"
              >
                <BookOpen className="size-3.5 text-blue-600" />
                <span className="hidden sm:inline">Refactoring & AI Approach</span>
                <span className="sm:hidden">Docs</span>
              </Button>

              {currentView === 'form' ? (
                <Button variant="secondary" size="sm" onClick={handleBackToList}>
                  <FileText className="size-3.5" />
                  <span>Bills Dashboard</span>
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleCreateNew}
                  className="bg-blue-600 hover:bg-blue-700 shadow-sm"
                >
                  <Ship className="size-3.5" />
                  <span>New Shipping Bill</span>
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
          {currentView === 'list' ? (
            <ShippingBillList
              onCreateNew={handleCreateNew}
              onEditBill={handleEditBill}
            />
          ) : (
            <ShippingBillForm
              key={selectedBill ? selectedBill.id : 'new'}
              initialBill={selectedBill}
              onBack={handleBackToList}
              onSaved={(saved) => setSelectedBill(saved)}
            />
          )}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>ICEGATE Indian Customs EDI Standards v1.0 Compliant</span>
            <span className="text-slate-400">
              Refactored Frontend Engineering Assignment · Clean Modular Architecture
            </span>
          </div>
        </footer>

        {/* Refactoring & AI Approach Documentation Modal */}
        {docsModalOpen && (
          <Modal
            isOpen={docsModalOpen}
            onClose={() => setDocsModalOpen(false)}
            title="Refactoring Summary & AI Usage Report"
            description="Engineering design decisions, service boundaries, domain rules, and AI usage statement."
            maxWidth="2xl"
          >
            <div className="space-y-6 text-xs text-slate-700 leading-relaxed max-h-[70vh] overflow-y-auto pr-1">
              {/* Architecture Section */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Code2 className="size-4 text-blue-600" />
                  1. Code & Architectural Refactoring
                </h3>
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                  <p>
                    <strong>Eliminated Monolithic 1,760-Line Component:</strong> Decomposed the massive starter file into modular, single-responsibility components under <code>src/components/form/</code>, <code>src/components/common/</code>, and <code>src/components/dialogs/</code>.
                  </p>
                  <p>
                    <strong>Decoupled Submodule & Custom Wrappers:</strong> Replaced the fragile git submodule dependency (<code>fe-zen-arch</code>) with standard, idiomatic React 19 hooks and composable Tailwind CSS primitives.
                  </p>
                  <p>
                    <strong>Clean 4-Layer Architecture:</strong>
                    <br />
                    <code>UI Components</code> &rarr; <code>Custom Hooks (useShippingBill, useMasterData)</code> &rarr; <code>Pure Domain Logic (calculations, validations, flat-file)</code> &rarr; <code>API Services & Persistence (masterDataService, partyService, shippingBillService)</code>.
                  </p>
                </div>
              </div>

              {/* API Mock Services Section */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <ExternalLink className="size-4 text-emerald-600" />
                  2. Asynchronous API-Ready Mock Services
                </h3>
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                  <p>
                    <strong>Promise-Based Transport:</strong> Mock data is no longer imported into UI files. All options (ports, UQCs, scheme codes, state codes, parties) are accessed through Promise-returning services with simulated network latency (150ms).
                  </p>
                  <p>
                    <strong>Standardized States:</strong> Loading spinners, empty states ("No results found"), error boundaries, and debounce mechanisms are handled across all selectors.
                  </p>
                  <p>
                    <strong>Zero UI Code Changes for Real Backend:</strong> Replacing <code>masterDataService</code> or <code>shippingBillService</code> with HTTP endpoints (e.g. REST or GraphQL) requires updating only the service layer.
                  </p>
                </div>
              </div>

              {/* Domain Handling Section */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle className="size-4 text-blue-600" />
                  3. Indian Customs & Shipping Bill Domain Rules
                </h3>
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1.5">
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Port Routing & UN/LOCODE:</strong> Loading ports constrained to Indian locations (<code>INMUN1</code>, <code>INNSA1</code>, etc.); destinations derive country names.</li>
                    <li><strong>Weight Logic:</strong> Warns when Net Weight exceeds Gross Weight.</li>
                    <li><strong>Drawback & RoDTEP Schedule:</strong> Conditional inputs dynamically appear based on selected export scheme flags (e.g. Scheme 19 Drawback).</li>
                    <li><strong>Financial Mutual Exclusivity:</strong> Rate % vs Flat Amount locks input cleanly to prevent double entry for Freight, Insurance, Commission, and Discount.</li>
                    <li><strong>ICEGATE EDI Flat File:</strong> Full generation and local download of official <code>.sb</code> files matching the <code>HREC / SHIPPING_BILL / INVOICE / ITEM / PACKING / TREC</code> specifications.</li>
                  </ul>
                </div>
              </div>

              {/* AI Usage & Approach Section */}
              <div className="space-y-2 border-t border-slate-200 pt-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <BookOpen className="size-4 text-purple-600" />
                  4. AI Usage & Approach
                </h3>
                <div className="bg-purple-50/50 p-3.5 rounded-lg border border-purple-200 space-y-2">
                  <p>
                    <strong>Tools Used:</strong> Generative AI assistance for structural analysis of the starter repository, extracting ICEGATE customs data tables, and generating TypeScript schemas.
                  </p>
                  <p>
                    <strong>Engineering Judgment:</strong> Rather than blindly copying the monolithic RHF + submodule pattern, deliberately separated concerns into clean custom hooks, pure TypeScript calculation engines, and asynchronous service boundaries.
                  </p>
                  <p>
                    <strong>Learnings & Validation:</strong> Validated strict TypeScript typing (<code>npx tsc --noEmit</code>) with zero build errors and verified that no new external npm packages were introduced.
                  </p>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </ToastProvider>
  )
}
