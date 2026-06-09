"use client"

import { useState } from "react"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MoreHorizontal, Eye, EyeOff, Trash2, Loader2, Pencil } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { revalidateBenefitsCache } from "@/app/admin/benefits/actions"

interface Props {
  benefitId: string
  isActive: boolean
  title: string
  description: string
  businessId: string | null
  discountType: string
  discountValue: string | null
  savingsValue: number | null
  regularPrice: number | null
  rideperksPrice: number | null
  terms: string | null
  usageLimitPerDriver: number | null
  validUntil: string | null
  businesses: { id: string; name: string }[]
}

export default function BenefitRowActions({
  benefitId, isActive, title, description, businessId,
  discountType, discountValue, savingsValue, regularPrice, rideperksPrice,
  terms, usageLimitPerDriver, validUntil, businesses,
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [editDialog, setEditDialog] = useState(false)
  const [form, setForm] = useState({
    title,
    description,
    business_id: businessId ?? "",
    discount_type: discountType,
    discount_value: discountValue ?? "",
    savings_value: savingsValue != null ? String(savingsValue) : "",
    regular_price: regularPrice != null ? String(regularPrice) : "",
    rideperks_price: rideperksPrice != null ? String(rideperksPrice) : "",
    terms: terms ?? "",
    usage_limit_per_driver: usageLimitPerDriver != null ? String(usageLimitPerDriver) : "",
    valid_until: validUntil ? validUntil.split("T")[0] : "",
  })

  const [deleteDialog, setDeleteDialog] = useState(false)

  function set(field: string, value: string) {
    setForm((p) => ({ ...p, [field]: value }))
  }

  async function toggle() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from("benefits").update({ is_active: !isActive }).eq("id", benefitId)
    toast.success(isActive ? "Beneficio desactivado" : "Beneficio activado")
    await revalidateBenefitsCache()
    setLoading(false)
    router.refresh()
  }

  async function saveEdit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!form.title || !form.description || !form.business_id) {
      toast.error("Título, descripción y comercio son requeridos")
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from("benefits").update({
      title: form.title.trim(),
      description: form.description.trim(),
      business_id: form.business_id || null,
      discount_type: form.discount_type,
      discount_value: form.discount_value.trim() || null,
      savings_value: form.savings_value ? parseFloat(form.savings_value) : null,
      regular_price: form.regular_price ? parseFloat(form.regular_price) : null,
      rideperks_price: form.rideperks_price ? parseFloat(form.rideperks_price) : null,
      terms: form.terms.trim() || null,
      usage_limit_per_driver: form.usage_limit_per_driver ? parseInt(form.usage_limit_per_driver) : null,
      valid_until: form.valid_until || null,
    }).eq("id", benefitId)

    if (error) {
      toast.error("Error al guardar los cambios")
    } else {
      toast.success("Beneficio actualizado")
      setEditDialog(false)
      await revalidateBenefitsCache()
      router.refresh()
    }
    setLoading(false)
  }

  async function deleteBenefit() {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from("benefits").delete().eq("id", benefitId)
    if (error) {
      toast.error("Error al eliminar el beneficio")
    } else {
      toast.success("Beneficio eliminado")
      setDeleteDialog(false)
      await revalidateBenefitsCache()
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="pressable inline-flex items-center justify-center h-7 w-7 rounded-md disabled:opacity-50 flex-shrink-0"
          style={{ color: "var(--mute)" }}
          disabled={loading}
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MoreHorizontal className="w-3.5 h-3.5" />}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={toggle}>
            {isActive ? <><EyeOff className="w-4 h-4 mr-2" />Desactivar</> : <><Eye className="w-4 h-4 mr-2" />Activar</>}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            setForm({
              title, description, business_id: businessId ?? "",
              discount_type: discountType, discount_value: discountValue ?? "",
              savings_value: savingsValue != null ? String(savingsValue) : "",
              regular_price: regularPrice != null ? String(regularPrice) : "",
              rideperks_price: rideperksPrice != null ? String(rideperksPrice) : "",
              terms: terms ?? "",
              usage_limit_per_driver: usageLimitPerDriver != null ? String(usageLimitPerDriver) : "",
              valid_until: validUntil ? validUntil.split("T")[0] : "",
            })
            setEditDialog(true)
          }}>
            <Pencil className="w-4 h-4 mr-2" />Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => setDeleteDialog(true)}>
            <Trash2 className="w-4 h-4 mr-2" />Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ── EDIT DIALOG ─────────────────────────────────── */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar beneficio</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveEdit} className="space-y-4">
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input value={form.title} onChange={(e) => set("title", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Descripción *</Label>
              <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} required />
            </div>
            <div className="space-y-2">
              <Label>Comercio *</Label>
              <Select onValueChange={(v) => v && set("business_id", v)} value={form.business_id}>
                <SelectTrigger><SelectValue placeholder="Selecciona el comercio" /></SelectTrigger>
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
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
                type="number" step="0.01"
                value={form.savings_value}
                onChange={(e) => set("savings_value", e.target.value)}
                placeholder="Ej: 18.40"
              />
              <p className="text-xs" style={{ color: "var(--mute)" }}>
                Cuánto ahorra el conductor en dólares por cada uso.
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
              <Textarea value={form.terms} onChange={(e) => set("terms", e.target.value)} rows={2} />
            </div>
            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setEditDialog(false)}>Cancelar</Button>
              <Button type="submit" className="flex-1 gradient-brand border-0 text-white" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar cambios"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── DELETE DIALOG ───────────────────────────────── */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar beneficio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm" style={{ color: "var(--mute)" }}>
              ¿Seguro que quieres eliminar <span className="font-semibold" style={{ color: "var(--midnight)" }}>{title}</span>? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setDeleteDialog(false)}>Cancelar</Button>
              <Button
                className="flex-1 border-0 text-white"
                style={{ backgroundColor: "var(--ember)" }}
                disabled={loading}
                onClick={deleteBenefit}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Eliminar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
