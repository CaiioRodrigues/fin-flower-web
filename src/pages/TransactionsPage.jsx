import { useMemo, useState } from 'react'
import Filters from '../components/Filters.jsx'
import Summary from '../components/Summary.jsx'
import TransactionForm from '../components/TransactionForm.jsx'
import TransactionList from '../components/TransactionList.jsx'
import { useTransactions } from '../hooks/useTransactions.js'

export default function TransactionsPage() {
  const { transactions, create, update, remove } = useTransactions()
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()
    return transactions
      .filter((item) => (typeFilter === 'all' ? true : item.type === typeFilter))
      .filter((item) =>
        term === ''
          ? true
          : item.description.toLowerCase().includes(term) ||
            item.category.toLowerCase().includes(term),
      )
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [transactions, search, typeFilter])

  const totals = useMemo(
    () =>
      visible.reduce(
        (acc, item) => {
          if (item.type === 'income') acc.income += item.amount
          else acc.expense += item.amount
          return acc
        },
        { income: 0, expense: 0 },
      ),
    [visible],
  )

  function handleSubmit(data) {
    if (editing) {
      update(editing.id, data)
      setEditing(null)
    } else {
      create(data)
    }
  }

  function handleDelete(transaction) {
    const confirmed = window.confirm(`Excluir "${transaction.description}"?`)
    if (!confirmed) return
    if (editing?.id === transaction.id) setEditing(null)
    remove(transaction.id)
  }

  return (
    <>
      <div className="page-intro">
        <h2>Lançamentos</h2>
        <p className="muted">
          Estes lançamentos ainda ficam salvos no navegador. A migração para os
          eventos da API é o próximo passo.
        </p>
      </div>

      <main className="content">
        <TransactionForm
          editing={editing}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />

        <section className="panel">
          <Summary income={totals.income} expense={totals.expense} />
          <Filters
            search={search}
            type={typeFilter}
            onSearchChange={setSearch}
            onTypeChange={setTypeFilter}
          />
          <TransactionList
            transactions={visible}
            onEdit={setEditing}
            onDelete={handleDelete}
          />
        </section>
      </main>

      <p className="footer muted">
        {transactions.length} lançamento(s) salvos no navegador (localStorage).
      </p>
    </>
  )
}
