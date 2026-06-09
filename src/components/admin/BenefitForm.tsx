"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { revalidateBenefitsCache } from "@/app/admin/benefits/actions"

interface Props {
  businesses: { id: string; name: string }[]
}

export default function BenefitForm({ businesses }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: "",
    description: "",
    business_id: "",
    discount_type: "percentage",
    discount_value: "",
    savings_value: "",
    regular_price: "",
    rideperks_price: "",
    terms: "",
    usage_limit_per_driver: "",
    valid_until: "",
  })

  function set(field: string, value: string) {
    setForm((p) => ({ ...p, [field]: value }))
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!form.title || !form.description || !form.business_id) {
      toast.error("Completa todos los campos requeridos")
      return
    }
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.from("benefits").insert({
      title: form.title,
      description: form.description,
      business_id: form.business_id || null,
      discount_type: form.discount_type,
      discount_value: form.discount_value || null,
      savings_value: form.savings_value ? parseFloat(form.savings_value) : null,
      regular_price: form.regular_price ? parseFloat(form.regular_price) : null,
      rideperks_price: form.rideperks_price ? parseFloat(form.rideperks_price) : null,
      terms: form.terms || null,
      usage_limit_per_driver: form.usage_limit_per_driver ? parseInt(form.usage_limit_per_driver) : null,
      valid_until: form.valid_until || null,
      applicable_platforms: ["uber", "indrive", "pedidosya"],
    })

    if (error) {
      toast.error("Error al crear el beneficio")
    } else {
      toast.success("Beneficio creado correctamente")
      setOpen(false)
      setForm({ title: "", description: "", business_id: "", discount_type: "percentage", discount_value: "", savings_value: "", regular_price: "", rideperks_price: "", terms: "", usage_limit_per_driver: "", valid_until: "" })
      await revalidateBenefitsCache()
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <>
      <Button className="gradient-brand border-0 text-white" onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        Nuevo beneficio
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear nuevo beneficio</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Ej: 20% en combustible" required />
          </div>
          <div className="space-y-2">
            <Label>Descripción *</Label>
            <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Descripción del beneficio..." rows={2} required />
          </div>
          <div className="space-y-2">
            <Label>Comercio *</Label>
            <Select onValueChange={(v) => v && set("business_id", v)} value={form.business_id}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccioná el comercio" />
              </SelectTrigger>
              <SelectContent>
                {businesses.map((b) => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Tipo de descuento</Label>
              <Select onValueChange={(v) => v && set("discount_type", v)} value={form.discount_type}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Porcentaje</SelectItem>
                  <SelectItem value="fixed">Monto fijo</SelectItem>
                  <SelectItem value="free_item">Artículo gratis</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Valor del descuento</Label>
              <Input value={form.discount_value} onChange={(e) => set("discount_value", e.target.value)} placeholder="Ej: 20% o $5" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Valor de ahorro estimado ($)</Label>
            <Input
              type="number"
              step="0.01"
              value={form.savings_value}
              onChange={(e) => set("savings_value", e.target.value)}
              placeholder="Ej: 18.40"
            />
            <p className="text-xs" style={{ color: "var(--mute)" }}>
              Cuánto ahorra el conductor en balboas por cada uso. Aparece en su resumen mensual.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Límite de uso por mes</Label>
              <Input type="number" value={form.usage_limit_per_driver} onChange={(e) => set("usage_limit_per_driver", e.target.value)} placeholder="Sin límite" min="1" />
            </div>
            <div className="space-y-2">
              <Label>Válido hasta</Label>
              <Input type="date" value={form.valid_until} onChange={(e) => set("valid_until", e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Comparativa de precios (opcional)</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-xs" style={{ color: "var(--mute)" }}>Precio regular ($)</p>
                <Input type="number" step="0.01" min="0" value={form.regular_price} onChange={(e) => set("regular_price", e.target.value)} placeholder="60.00" />
              </div>
              <div className="space-y-1">
                <p className="text-xs" style={{ color: "var(--mute)" }}>Precio RidePerks ($)</p>
                <Input type="number" step="0.01" min="0" value={form.rideperks_price} onChange={(e) => set("rideperks_price", e.target.value)} placeholder="40.00" />
              </div>
            </div>
            <p className="text-xs" style={{ color: "var(--mute)" }}>Aparece como "Ver precios" en el beneficio del conductor.</p>
          </div>
          <div className="space-y-2">
            <Label>Términos y condiciones</Label>
            <Textarea value={form.terms} onChange={(e) => set("terms", e.target.value)} placeholder="Condiciones del descuento..." rows={2} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1 gradient-brand border-0 text-white" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Crear beneficio"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  )
}
