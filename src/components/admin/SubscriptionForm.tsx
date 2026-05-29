"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Props {
  drivers: { id: string; full_name: string; phone: string | null }[]
}

export default function SubscriptionForm({ drivers }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    driver_id: "",
    starts_at: new Date().toISOString().slice(0, 10),
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    amount: "",
    payment_method: "cash",
    payment_reference: "",
    notes: "",
  })

  function set(field: string, value: string) {
    setForm((p) => ({ ...p, [field]: value }))
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!form.driver_id) {
      toast.error("Seleccioná un conductor")
      return
    }
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from("subscriptions").insert({
      driver_id: form.driver_id,
      status: "active",
      plan_name: "monthly",
      starts_at: new Date(form.starts_at).toISOString(),
      expires_at: new Date(form.expires_at).toISOString(),
      amount: form.amount ? parseFloat(form.amount) : null,
      payment_method: form.payment_method as "yappy" | "transfer" | "cash",
      payment_reference: form.payment_reference || null,
      notes: form.notes || null,
      created_by: user?.id,
    })

    if (error) {
      toast.error("Error al crear la membresía")
    } else {
      toast.success("Membresía activada correctamente")
      setOpen(false)
      setForm({ driver_id: "", starts_at: new Date().toISOString().slice(0, 10), expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), amount: "", payment_method: "cash", payment_reference: "", notes: "" })
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <>
      <Button className="gradient-brand border-0 text-white" onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        Activar membresía
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Activar membresía manual</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Conductor *</Label>
            <Select onValueChange={(v) => v && set("driver_id", v)} value={form.driver_id}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccioná el conductor" />
              </SelectTrigger>
              <SelectContent>
                {drivers.length === 0 ? (
                  <SelectItem value="none" disabled>No hay conductores verificados</SelectItem>
                ) : (
                  drivers.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.full_name} {d.phone ? `(${d.phone})` : ""}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Fecha de inicio *</Label>
              <Input type="date" value={form.starts_at} onChange={(e) => set("starts_at", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Fecha de vencimiento *</Label>
              <Input type="date" value={form.expires_at} onChange={(e) => set("expires_at", e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Monto cobrado (USD)</Label>
              <Input type="number" step="0.01" value={form.amount} onChange={(e) => set("amount", e.target.value)} placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label>Método de pago</Label>
              <Select onValueChange={(v) => v && set("payment_method", v)} value={form.payment_method}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Efectivo</SelectItem>
                  <SelectItem value="yappy">Yappy</SelectItem>
                  <SelectItem value="transfer">Transferencia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Referencia de pago</Label>
            <Input value={form.payment_reference} onChange={(e) => set("payment_reference", e.target.value)} placeholder="Número de confirmación o nota" />
          </div>
          <div className="space-y-2">
            <Label>Notas internas</Label>
            <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Notas adicionales..." rows={2} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1 gradient-brand border-0 text-white" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Activar membresía"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  )
}
