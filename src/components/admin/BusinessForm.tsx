"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function BusinessForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: "", description: "", category: "", address: "", phone: "", access_code: "",
  })

  function set(field: string, value: string) {
    setForm((p) => ({ ...p, [field]: value }))
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!form.name || !form.access_code) {
      toast.error("Nombre y código de acceso son requeridos")
      return
    }
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.from("partner_businesses").insert({
      name: form.name,
      description: form.description || null,
      category: form.category || null,
      address: form.address || null,
      phone: form.phone || null,
      access_code: form.access_code.toUpperCase(),
    })

    if (error) {
      if (error.code === "23505") {
        toast.error("Ese código de acceso ya existe. Elige uno diferente.")
      } else {
        toast.error("Error al crear el comercio")
      }
    } else {
      toast.success("Comercio creado correctamente")
      setOpen(false)
      setForm({ name: "", description: "", category: "", address: "", phone: "", access_code: "" })
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <>
      <Button className="gradient-brand border-0 text-white" onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        Nuevo comercio
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Agregar comercio aliado</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre del comercio *</Label>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Ej: Estación Shell Miraflores" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Input value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="Ej: Combustible" />
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+507 000-0000" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Dirección</Label>
            <Input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Ej: Ave. Balboa, Ciudad de Panamá" />
          </div>
          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Descripción breve del comercio..." rows={2} />
          </div>
          <div className="space-y-2">
            <Label>Código de acceso del comercio *</Label>
            <Input
              value={form.access_code}
              onChange={(e) => set("access_code", e.target.value.toUpperCase())}
              placeholder="Ej: SHELL01"
              required
              className="font-mono tracking-widest"
            />
            <p className="text-xs text-muted-foreground">
              Este código lo usará el comercio para verificar QRs. Debe ser único y fácil de recordar.
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1 gradient-brand border-0 text-white" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Crear comercio"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  )
}
