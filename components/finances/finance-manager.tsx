"use client"

import { useState, useTransition, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Wallet,
  Tag,
  Receipt,
  Repeat,
  Landmark,
  Trash2,
  Loader2,
  DollarSign,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CurrencyInput } from "@/components/ui/currency-input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCurrency } from "@/components/providers/currency-provider"
import { formatCurrency } from "@/lib/calculator/utils"
import { upsertFinancialGoal } from "@/lib/financial/actions"
import { toast } from "sonner"
import type { FinancialGoal } from "@/lib/financial/actions"
import {
  addCategory,
  deleteCategory,
  addExpense,
  deleteExpense,
  addSubscription,
  deleteSubscription,
  addLoan,
  deleteLoan,
} from "@/lib/finances/actions"
import type {
  ExpenseCategory,
  Expense,
  Subscription,
  Loan,
} from "@/lib/finances/actions"

function EmptyState({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType
  title: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6 glass-card rounded-3xl">
      <div className="w-14 h-14 rounded-2xl bg-[var(--accent-color)]/15 flex items-center justify-center mb-4">
        <Icon size={28} strokeWidth={1.75} className="text-[var(--accent-color)]" />
      </div>
      <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">{title}</h3>
      {children && <p className="text-sm text-[#8a8a8a] max-w-sm">{children}</p>}
    </div>
  )
}

const PRESET_COLORS = [
  { value: "#0066cc", name: "Blue" },
  { value: "#34c759", name: "Green" },
  { value: "#ff9500", name: "Orange" },
  { value: "#ff3b30", name: "Red" },
  { value: "#af52de", name: "Purple" },
  { value: "#5856d6", name: "Indigo" },
  { value: "#ff2d55", name: "Pink" },
  { value: "#5ac8fa", name: "Sky" },
]

interface FinanceManagerProps {
  goal: FinancialGoal | null
  categories: ExpenseCategory[]
  expenses: Expense[]
  subscriptions: Subscription[]
  loans: Loan[]
}

export function FinanceManager({
  goal,
  categories,
  expenses,
  subscriptions,
  loans,
}: FinanceManagerProps) {
  const currency = useCurrency()
  const [isPending, startTransition] = useTransition()
  const searchParams = useSearchParams()
  const router = useRouter()
  const tabParam = searchParams.get("tab")
  const validTabs = ["income", "categories", "expenses", "subscriptions", "loans"]
  const initialTab = tabParam && validTabs.includes(tabParam) ? tabParam : "income"
  const [activeTab, setActiveTab] = useState(initialTab)

  useEffect(() => {
    if (tabParam && validTabs.includes(tabParam) && tabParam !== activeTab) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  function handleTabChange(value: string) {
    setActiveTab(value)
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", value)
    router.replace(`/finances?${params.toString()}`, { scroll: false })
  }

  // Income form
  const [monthlyIncome, setMonthlyIncome] = useState(
    Number(goal?.monthly_income) || 0
  )

  // Category form
  const [categoryName, setCategoryName] = useState("")
  const [categoryColor, setCategoryColor] = useState(PRESET_COLORS[0].value)
  const [categoryBudget, setCategoryBudget] = useState("")

  // Expense form
  const [expenseName, setExpenseName] = useState("")
  const [expenseAmount, setExpenseAmount] = useState("")
  const [expenseCategory, setExpenseCategory] = useState("")
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().split("T")[0]
  )
  const [expenseRecurring, setExpenseRecurring] = useState(false)

  // Subscription form
  const [subName, setSubName] = useState("")
  const [subAmount, setSubAmount] = useState("")
  const [subFrequency, setSubFrequency] = useState<"monthly" | "yearly">("monthly")
  const [subDueDate, setSubDueDate] = useState("")

  // Loan form
  const [loanName, setLoanName] = useState("")
  const [loanTotal, setLoanTotal] = useState("")
  const [loanRemaining, setLoanRemaining] = useState("")
  const [loanPayment, setLoanPayment] = useState("")
  const [loanRate, setLoanRate] = useState("")
  const [loanDueDate, setLoanDueDate] = useState("")

  // Undo-able deletes: hide immediately, actually delete after a grace period
  const [pendingDeleteIds, setPendingDeleteIds] = useState<Set<string>>(new Set())
  const pendingDeleteRef = useRef<Map<string, { timeout: ReturnType<typeof setTimeout>; run: () => void }>>(new Map())

  useEffect(() => {
    const pending = pendingDeleteRef.current
    return () => {
      pending.forEach(({ timeout, run }) => {
        clearTimeout(timeout)
        run()
      })
    }
  }, [])

  function deleteWithUndo(id: string, label: string, deleteFn: (id: string) => Promise<unknown>) {
    setPendingDeleteIds((prev) => new Set(prev).add(id))

    const run = () => {
      startTransition(async () => {
        await deleteFn(id)
      })
    }

    const timeout = setTimeout(() => {
      run()
      pendingDeleteRef.current.delete(id)
    }, 5000)
    pendingDeleteRef.current.set(id, { timeout, run })

    toast(`${label} deleted`, {
      action: {
        label: "Undo",
        onClick: () => {
          const pending = pendingDeleteRef.current.get(id)
          if (pending) {
            clearTimeout(pending.timeout)
            pendingDeleteRef.current.delete(id)
          }
          setPendingDeleteIds((prev) => {
            const next = new Set(prev)
            next.delete(id)
            return next
          })
        },
      },
    })
  }

  function handleSaveIncome() {
    startTransition(async () => {
      await upsertFinancialGoal({ monthly_income: monthlyIncome })
      toast.success("Income saved")
    })
  }

  function handleAddCategory(e: React.FormEvent) {
    e.preventDefault()
    if (!categoryName.trim()) return
    startTransition(async () => {
      await addCategory({
        name: categoryName,
        color: categoryColor,
        budget_limit: Number(categoryBudget) || 0,
      })
      toast.success("Category added")
      setCategoryName("")
      setCategoryBudget("")
    })
  }

  function handleAddExpense(e: React.FormEvent) {
    e.preventDefault()
    if (!expenseName.trim() || !expenseAmount) return
    startTransition(async () => {
      await addExpense({
        category_id: expenseCategory || null,
        name: expenseName,
        amount: Number(expenseAmount),
        expense_date: expenseDate,
        is_recurring: expenseRecurring,
      })
      toast.success("Expense added")
      setExpenseName("")
      setExpenseAmount("")
      setExpenseRecurring(false)
    })
  }

  function handleAddSubscription(e: React.FormEvent) {
    e.preventDefault()
    if (!subName.trim() || !subAmount) return
    startTransition(async () => {
      await addSubscription({
        name: subName,
        amount: Number(subAmount),
        frequency: subFrequency,
        next_due_date: subDueDate,
      })
      toast.success("Subscription added")
      setSubName("")
      setSubAmount("")
      setSubDueDate("")
    })
  }

  function handleAddLoan(e: React.FormEvent) {
    e.preventDefault()
    if (!loanName.trim() || !loanTotal) return
    startTransition(async () => {
      await addLoan({
        name: loanName,
        total_amount: Number(loanTotal),
        remaining_amount: Number(loanRemaining) || 0,
        monthly_payment: Number(loanPayment) || 0,
        interest_rate: Number(loanRate) || 0,
        due_date: loanDueDate,
      })
      toast.success("Loan added")
      setLoanName("")
      setLoanTotal("")
      setLoanRemaining("")
      setLoanPayment("")
      setLoanRate("")
      setLoanDueDate("")
    })
  }

  const visibleCategories = categories.filter((c) => !pendingDeleteIds.has(c.id))
  const visibleExpenses = expenses.filter((e) => !pendingDeleteIds.has(e.id))
  const visibleSubscriptions = subscriptions.filter((s) => !pendingDeleteIds.has(s.id))
  const visibleLoans = loans.filter((l) => !pendingDeleteIds.has(l.id))

  const spentByCategory: Record<string, number> = {}
  expenses.forEach((expense) => {
    if (expense.category_id) {
      spentByCategory[expense.category_id] =
        (spentByCategory[expense.category_id] || 0) + Number(expense.amount)
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#1d1d1f]">
          Finances
        </h1>
        <p className="text-[#8a8a8a] mt-1">
          Manage your income, expenses, subscriptions, and loans.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="bg-white p-1.5 rounded-2xl h-auto inline-flex w-full sm:w-fit gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden scrollbar-none shadow-sm border border-[#e8e0cc]">
          <TabsTrigger
            value="income"
            style={{ height: "3rem" }}
            className="flex-1 sm:flex-none px-4 sm:px-5 rounded-2xl text-sm font-medium text-[#8a8a8a] transition-all duration-200 hover:text-[#1d1d1f] data-[state=active]:bg-[var(--accent-color)] data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm"
          >
            <DollarSign size={15} strokeWidth={1.75}  />
            Income
          </TabsTrigger>
          <TabsTrigger
            value="categories"
            style={{ height: "3rem" }}
            className="flex-1 sm:flex-none px-4 sm:px-5 rounded-2xl text-sm font-medium text-[#8a8a8a] transition-all duration-200 hover:text-[#1d1d1f] data-[state=active]:bg-[var(--accent-color)] data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm"
          >
            <Tag size={15} strokeWidth={1.75}  />
            Categories
          </TabsTrigger>
          <TabsTrigger
            value="expenses"
            style={{ height: "3rem" }}
            className="flex-1 sm:flex-none px-4 sm:px-5 rounded-2xl text-sm font-medium text-[#8a8a8a] transition-all duration-200 hover:text-[#1d1d1f] data-[state=active]:bg-[var(--accent-color)] data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm"
          >
            <Receipt size={15} strokeWidth={1.75}  />
            Expenses
          </TabsTrigger>
          <TabsTrigger
            value="subscriptions"
            style={{ height: "3rem" }}
            className="flex-1 sm:flex-none px-4 sm:px-5 rounded-2xl text-sm font-medium text-[#8a8a8a] transition-all duration-200 hover:text-[#1d1d1f] data-[state=active]:bg-[var(--accent-color)] data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm"
          >
            <Repeat size={15} strokeWidth={1.75}  />
            Subscriptions
          </TabsTrigger>
          <TabsTrigger
            value="loans"
            style={{ height: "3rem" }}
            className="flex-1 sm:flex-none px-4 sm:px-5 rounded-2xl text-sm font-medium text-[#8a8a8a] transition-all duration-200 hover:text-[#1d1d1f] data-[state=active]:bg-[var(--accent-color)] data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm"
          >
            <Landmark size={15} strokeWidth={1.75}  />
            Loans
          </TabsTrigger>
        </TabsList>

        <TabsContent value="income" className="mt-6 space-y-4">
          {!goal && (
            <EmptyState icon={Wallet} title="Start tracking your income">
              Add your main monthly income so the dashboard can project your quit date.
            </EmptyState>
          )}
          <Card className="glass-card rounded-3xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#1d1d1f] flex items-center gap-2">
                <Wallet size={18} strokeWidth={1.75} />
                Monthly Income
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[#1d1d1f]">Your main monthly income</Label>
                <CurrencyInput
                  value={monthlyIncome}
                  onChange={(value) => setMonthlyIncome(value)}
                  className="rounded-xl"
                />
              </div>
              <Button
                onClick={handleSaveIncome}
                disabled={isPending}
                className="h-12 rounded-xl bg-[#1d1d1f] hover:bg-[#1d1d1f]/90 text-white px-6"
              >
                {isPending ? (
                  <Loader2 className="animate-spin" size={18} strokeWidth={1.75} />
                ) : (
                  "Save income"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="mt-6 space-y-4">
          <Card className="glass-card rounded-3xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#1d1d1f]">
                Add category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCategory} className="flex flex-col md:flex-row gap-3 md:items-end">
                <div className="flex flex-col gap-1.5 flex-1">
                  <Label htmlFor="category-name">Category name</Label>
                  <Input
                    id="category-name"
                    placeholder="e.g. Rent"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="h-12 rounded-xl border-[rgba(0,0,0,0.08)] bg-[#f8f1de]/50"
                  />
                </div>
                <div className="flex flex-col gap-1.5 md:w-40">
                  <Label htmlFor="category-budget">Budget limit</Label>
                  <CurrencyInput
                    id="category-budget"
                    value={categoryBudget}
                    onChange={(value) => setCategoryBudget(String(value))}
                  />
                </div>
                <div className="flex flex-col gap-1.5 md:w-48">
                  <Label htmlFor="category-color">Color</Label>
                  <Select value={categoryColor} onValueChange={setCategoryColor}>
                  <SelectTrigger id="category-color" className="h-12 rounded-xl border-[rgba(0,0,0,0.08)] bg-[#f8f1de]/50 w-full">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full shrink-0"
                        style={{ background: categoryColor }}
                      />
                      <span className="text-[#8a8a8a]">
                        {PRESET_COLORS.find((c) => c.value === categoryColor)?.name ?? "Color"}
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl" position="popper" sideOffset={4}>
                    {PRESET_COLORS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2 w-full min-w-[8rem]">
                          <div
                            className="w-4 h-4 rounded-full shrink-0"
                            style={{ background: color.value }}
                          />
                          <span>{color.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  disabled={isPending || !categoryName.trim()}
                  className="h-12 rounded-xl bg-[#1d1d1f] hover:bg-[#1d1d1f]/90 text-white px-6"
                >
                  Add
                </Button>
              </form>
            </CardContent>
          </Card>

          {visibleCategories.length === 0 && (
            <EmptyState icon={Tag} title="Start tracking your categories">
              Create categories like Rent, Food, and Subscriptions to organize your spending.
            </EmptyState>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleCategories.map((category) => {
              const spent = spentByCategory[category.id] || 0
              const budget = Number(category.budget_limit)
              const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0
              const isOver = budget > 0 && spent > budget
              return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="glass-card rounded-3xl">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-10 rounded-full"
                          style={{ background: category.color }}
                        />
                        <div>
                          <p className="font-semibold text-[#1d1d1f]">{category.name}</p>
                          {budget > 0 ? (
                            <p className="text-sm text-[#8a8a8a]">
                              {formatCurrency(spent, currency)} of {formatCurrency(budget, currency)} spent
                            </p>
                          ) : (
                            <p className="text-sm text-[#8a8a8a]">
                              {formatCurrency(spent, currency)} spent this month
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteWithUndo(category.id, "Category", deleteCategory)}
                        className="rounded-xl text-[#8a8a8a] hover:text-[#ff3b30]"
                      >
                        <Trash2 size={16} strokeWidth={1.75} />
                      </Button>
                    </div>
                    {budget > 0 && (
                      <div className="h-1.5 bg-[#f8f1de] rounded-full overflow-hidden mt-3">
                        <div
                          className={`h-full rounded-full ${isOver ? "bg-[#ff3b30]" : "bg-[var(--accent-color)]"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="mt-6 space-y-4">
          <Card className="glass-card rounded-3xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#1d1d1f]">
                Add expense
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddExpense} className="flex flex-col md:flex-row gap-3 flex-wrap md:items-end">
                <div className="flex flex-col gap-1.5 flex-1 min-w-50">
                  <Label htmlFor="expense-name">Expense name</Label>
                  <Input
                    id="expense-name"
                    placeholder="e.g. Groceries"
                    value={expenseName}
                    onChange={(e) => setExpenseName(e.target.value)}
                    className="h-12 rounded-xl border-[rgba(0,0,0,0.08)] bg-[#f8f1de]/50"
                  />
                </div>
                <div className="flex flex-col gap-1.5 md:w-32">
                  <Label htmlFor="expense-amount">Amount</Label>
                  <CurrencyInput
                    id="expense-amount"
                    value={expenseAmount}
                    onChange={(value) => setExpenseAmount(String(value))}
                  />
                </div>
                <div className="flex flex-col gap-1.5 md:w-48">
                  <Label htmlFor="expense-category">Category</Label>
                  <Select value={expenseCategory} onValueChange={setExpenseCategory}>
                    <SelectTrigger id="expense-category" className="h-12 rounded-xl border-[rgba(0,0,0,0.08)] bg-[#f8f1de]/50 w-full">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {categories.length === 0 && (
                    <p className="text-xs text-[#8a8a8a]">
                      No categories yet —{" "}
                      <button
                        type="button"
                        onClick={() => handleTabChange("categories")}
                        className="text-[var(--accent-color)] hover:underline"
                      >
                        add one
                      </button>
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5 md:w-44">
                  <Label htmlFor="expense-date">Date</Label>
                  <Input
                    id="expense-date"
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="h-12 rounded-xl border-[rgba(0,0,0,0.08)] bg-[#f8f1de]/50"
                  />
                </div>
                <label className="flex items-center gap-2 h-12 px-3">
                  <Checkbox
                    checked={expenseRecurring}
                    onCheckedChange={(checked) => setExpenseRecurring(checked === true)}
                  />
                  <span className="text-sm text-[#1d1d1f]">Recurring</span>
                </label>
                <Button
                  type="submit"
                  disabled={isPending || !expenseName.trim() || !expenseAmount}
                  className="h-12 rounded-xl bg-[#1d1d1f] hover:bg-[#1d1d1f]/90 text-white px-6"
                >
                  Add
                </Button>
              </form>
            </CardContent>
          </Card>

          {visibleExpenses.length === 0 && (
            <EmptyState icon={Receipt} title="Start tracking your expenses">
              Record your first expense to see where your money goes each month.
            </EmptyState>
          )}

          <div className="space-y-3">
            {visibleExpenses.map((expense) => {
              const category = categories.find((c) => c.id === expense.category_id)
              return (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="glass-card rounded-3xl">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-10 rounded-full"
                          style={{ background: category?.color ?? "#8a8a8a" }}
                        />
                        <div>
                          <p className="font-semibold text-[#1d1d1f]">{expense.name}</p>
                          <p className="text-sm text-[#8a8a8a]">
                            {category?.name ?? "Uncategorized"} • {expense.expense_date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-[#1d1d1f]">
                          {formatCurrency(Number(expense.amount), currency)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteWithUndo(expense.id, "Expense", deleteExpense)}
                          className="rounded-xl text-[#8a8a8a] hover:text-[#ff3b30]"
                        >
                          <Trash2 size={16} strokeWidth={1.75} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="subscriptions" className="mt-6 space-y-4">
          <Card className="glass-card rounded-3xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#1d1d1f]">
                Add subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddSubscription} className="flex flex-col md:flex-row gap-3 flex-wrap md:items-end">
                <div className="flex flex-col gap-1.5 flex-1 min-w-50">
                  <Label htmlFor="sub-name">Subscription name</Label>
                  <Input
                    id="sub-name"
                    placeholder="e.g. Netflix"
                    value={subName}
                    onChange={(e) => setSubName(e.target.value)}
                    className="h-12 rounded-xl border-[rgba(0,0,0,0.08)] bg-[#f8f1de]/50"
                  />
                </div>
                <div className="flex flex-col gap-1.5 md:w-32">
                  <Label htmlFor="sub-amount">Amount</Label>
                  <CurrencyInput
                    id="sub-amount"
                    value={subAmount}
                    onChange={(value) => setSubAmount(String(value))}
                  />
                </div>
                <div className="flex flex-col gap-1.5 md:w-40">
                  <Label htmlFor="sub-frequency">Frequency</Label>
                  <Select value={subFrequency} onValueChange={(v) => setSubFrequency(v as "monthly" | "yearly")}>
                    <SelectTrigger id="sub-frequency" className="h-12 rounded-xl border-[rgba(0,0,0,0.08)] bg-[#f8f1de]/50 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5 md:w-44">
                  <Label htmlFor="sub-due-date">Next due date</Label>
                  <Input
                    id="sub-due-date"
                    type="date"
                    value={subDueDate}
                    onChange={(e) => setSubDueDate(e.target.value)}
                    className="h-12 rounded-xl border-[rgba(0,0,0,0.08)] bg-[#f8f1de]/50"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isPending || !subName.trim() || !subAmount}
                  className="h-12 rounded-xl bg-[#1d1d1f] hover:bg-[#1d1d1f]/90 text-white px-6"
                >
                  Add
                </Button>
              </form>
            </CardContent>
          </Card>

          {visibleSubscriptions.length === 0 && (
            <EmptyState icon={Repeat} title="Start tracking your subscriptions">
              Add recurring payments like Netflix, gym, or software subscriptions.
            </EmptyState>
          )}

          <div className="space-y-3">
            {visibleSubscriptions.map((sub) => (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="glass-card rounded-3xl">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[#1d1d1f]">{sub.name}</p>
                      <p className="text-sm text-[#8a8a8a]">
                        {sub.frequency} • Next due: {sub.next_due_date ?? "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-[#1d1d1f]">
                        {formatCurrency(Number(sub.amount), currency)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteWithUndo(sub.id, "Subscription", deleteSubscription)}
                        className="rounded-xl text-[#8a8a8a] hover:text-[#ff3b30]"
                      >
                        <Trash2 size={16} strokeWidth={1.75} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="loans" className="mt-6 space-y-4">
          <Card className="glass-card rounded-3xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#1d1d1f]">
                Add loan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddLoan} className="flex flex-col md:flex-row gap-3 flex-wrap md:items-end">
                <div className="flex flex-col gap-1.5 flex-1 min-w-50">
                  <Label htmlFor="loan-name">Loan name</Label>
                  <Input
                    id="loan-name"
                    placeholder="e.g. Car loan"
                    value={loanName}
                    onChange={(e) => setLoanName(e.target.value)}
                    className="h-12 rounded-xl border-[rgba(0,0,0,0.08)] bg-[#f8f1de]/50"
                  />
                </div>
                <div className="flex flex-col gap-1.5 md:w-36">
                  <Label htmlFor="loan-total">Total amount</Label>
                  <CurrencyInput
                    id="loan-total"
                    value={loanTotal}
                    onChange={(value) => setLoanTotal(String(value))}
                  />
                </div>
                <div className="flex flex-col gap-1.5 md:w-36">
                  <Label htmlFor="loan-remaining">Remaining</Label>
                  <CurrencyInput
                    id="loan-remaining"
                    value={loanRemaining}
                    onChange={(value) => setLoanRemaining(String(value))}
                  />
                </div>
                <div className="flex flex-col gap-1.5 md:w-36">
                  <Label htmlFor="loan-payment">Monthly payment</Label>
                  <CurrencyInput
                    id="loan-payment"
                    value={loanPayment}
                    onChange={(value) => setLoanPayment(String(value))}
                  />
                </div>
                <div className="flex flex-col gap-1.5 md:w-32">
                  <Label htmlFor="loan-rate">Interest %</Label>
                  <Input
                    id="loan-rate"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={loanRate}
                    onChange={(e) => setLoanRate(e.target.value)}
                    className="h-12 rounded-xl border-[rgba(0,0,0,0.08)] bg-[#f8f1de]/50"
                  />
                </div>
                <div className="flex flex-col gap-1.5 md:w-44">
                  <Label htmlFor="loan-due-date">Due date</Label>
                  <Input
                    id="loan-due-date"
                    type="date"
                    value={loanDueDate}
                    onChange={(e) => setLoanDueDate(e.target.value)}
                    className="h-12 rounded-xl border-[rgba(0,0,0,0.08)] bg-[#f8f1de]/50"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isPending || !loanName.trim() || !loanTotal}
                  className="h-12 rounded-xl bg-[#1d1d1f] hover:bg-[#1d1d1f]/90 text-white px-6"
                >
                  Add
                </Button>
              </form>
            </CardContent>
          </Card>

          {visibleLoans.length === 0 && (
            <EmptyState icon={Landmark} title="Start tracking your loans">
              Add any loans or debt so you can see your total monthly obligations.
            </EmptyState>
          )}

          <div className="space-y-3">
            {visibleLoans.map((loan) => (
              <motion.div
                key={loan.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="glass-card rounded-3xl">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[#1d1d1f]">{loan.name}</p>
                      <p className="text-sm text-[#8a8a8a]">
                        {formatCurrency(Number(loan.remaining_amount), currency)} remaining •{" "}
                        {loan.interest_rate}% interest
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-[#1d1d1f]">
                        {formatCurrency(Number(loan.monthly_payment), currency)}/mo
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteWithUndo(loan.id, "Loan", deleteLoan)}
                        className="rounded-xl text-[#8a8a8a] hover:text-[#ff3b30]"
                      >
                        <Trash2 size={16} strokeWidth={1.75} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
