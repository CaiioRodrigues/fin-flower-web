import { useCallback, useEffect, useState } from 'react'
import { loadTransactions, saveTransactions } from '../services/storage.js'

function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

/**
 * Camada de dados do CRUD. Hoje persiste em localStorage; trocar por uma API
 * significa reescrever só as quatro funções abaixo.
 */
export function useTransactions() {
  const [transactions, setTransactions] = useState(loadTransactions)

  useEffect(() => {
    saveTransactions(transactions)
  }, [transactions])

  const create = useCallback((data) => {
    const transaction = { ...data, id: createId(), createdAt: new Date().toISOString() }
    setTransactions((current) => [transaction, ...current])
    return transaction
  }, [])

  const update = useCallback((id, data) => {
    setTransactions((current) =>
      current.map((item) => (item.id === id ? { ...item, ...data, id } : item)),
    )
  }, [])

  const remove = useCallback((id) => {
    setTransactions((current) => current.filter((item) => item.id !== id))
  }, [])

  const clearAll = useCallback(() => setTransactions([]), [])

  return { transactions, create, update, remove, clearAll }
}
