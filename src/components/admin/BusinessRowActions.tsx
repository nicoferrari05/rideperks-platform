"use client"

import { useState } from "react"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MoreHorizontal, Eye, EyeOff, Loader2, Trash2, KeyRound, Pencil } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Props {
  businessId: string
  isActive: boolean
  accessCode: string | null
  name: string
  category: string | null
  address: string | null
  phone: string | null
  description: string | null
}

export default function BusinessRowActions({
  businessId, isActive, accessCode, name,
  category, address, phone, description,
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [codeDialog, setCodeDialog] = useState(false)
  const [newCode, setNewCode] = useState(accessCode ?? "")

  const [editDialog, setEditDialog] = useState(false)
  const [editForm, setEditForm] = useState({ name, category: category ?? "", address: address ?? "", phone: phone ?? "", description: description ?? "" })

  const [deleteDialog, setDeleteDialog] = useState(false)
  const [confirmName, setConfirmName] = useState("")

  async function toggle() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from("partner_businesses").update({ is_active: !isActive }).eq("id", businessId)
    toast.success(isActive ? "Comercio desactivado" : "Comercio activado")
    setLoading(false)
    router.refresh()
  }

  async function saveCode(e: { preventDefault(): void }) {
    e.preventDefault()
    const code = newCode.trim().toUpperCase()
    if (code.length < 3) { toast.error("Mínimo 3 caracteres"); return }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from("partner_businesses").update({ access_code: code }).eq("id", businessId)
    if (error?.code === "23505") {
      toast.error("Ese código ya está en uso. Elige otro.")
    } else if (error) {
      toast.error("Error al actualizar el código")
    } else {
      toast.success("Código actualizado")
      setCodeDialog(false)
      router.refresh()
    }
    setLoading(false)
  }

  async function saveEdit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!editForm.name.trim()) { toast.error("El nombre es requerido"); return }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from("partner_businesses").update({
      name: editForm.name.trim(),
      category: editForm.category.trim() || null,
      address: editForm.address.trim() || null,
      phone: editForm.phone.trim() || null,
      description: editForm.description.trim() || null,
    }).eq("id", businessId)
    if (error) {
      toast.error("Error al guardar los cambios")
    } else {
      toast.success("Comercio actualizado")
      setEditDialog(false)
      router.refresh()
    }
    setLoading(false)
  }

  async function deleteBusiness() {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from("partner_businesses").delete().eq("id", businessId)
    if (error) {
      toast.error("Error al eliminar el comercio")
    } else {
      toast.success("Comercio eliminado")
      setDeleteDialog(false)
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
          {loading
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <MoreHorizontal className="w-3.5 h-3.5" />}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={toggle}>
            {isActive
              ? <><EyeOff className="w-4 h-4 mr-2" />Desactivar</>
              : <><Eye className="w-4 h-4 mr-2" />Activar</>}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => { setEditForm({ name, category: category ?? "", address: address ?? "", phone: phone ?? "", description: description ?? "" }); setEditDialog(true) }}>
            <Pencil className="w-4 h-4 mr-2" />Editar datos
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => { setNewCode(accessCode ?? ""); setCodeDialog(true) }}>
            <KeyRound className="w-4 h-4 mr-2" />Cambiar código
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onClick={() => { setConfirmName(""); setDeleteDialog(true) }}
          >
            <Trash2 className="w-4 h-4 mr-2" />Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ── EDIT DIALOG ─────────────────────────────────── */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar comercio</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveEdit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input value={editForm.name} onChange={(e) => setEditForm(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Input value={editForm.category} onChange={(e) => setEditForm(p => ({ ...p, category: e.target.value }))} placeholder="Ej: Taller" />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input value={editForm.phone} onChange={(e) => setEditForm(p => ({ ...p, phone: e.target.value }))} placeholder="+507 000-0000" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Dirección</Label>
              <Input value={editForm.address} onChange={(e) => setEditForm(p => ({ ...p, address: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea value={editForm.description} onChange={(e) => setEditForm(p => ({ ...p, description: e.target.value }))} rows={2} />
            </div>
            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setEditDialog(false)}>Cancelar</Button>
              <Button type="submit" className="flex-1 gradient-brand border-0 text-white" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── CHANGE CODE DIALOG ──────────────────────────── */}
      <Dialog open={codeDialog} onOpenChange={setCodeDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Cambiar código de acceso</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveCode} className="space-y-4">
            <div className="space-y-2">
              <Label>Nuevo código</Label>
              <Input
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                placeholder="TIENDA01"
                className="font-mono tracking-widest"
                autoFocus
              />
              <p className="text-xs" style={{ color: "var(--mute)" }}>
                Avísale al comercio su nuevo código antes de cambiarlo.
              </p>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setCodeDialog(false)}>Cancelar</Button>
              <Button type="submit" className="flex-1 gradient-brand border-0 text-white" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── DELETE DIALOG ───────────────────────────────── */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar comercio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-xl p-4 text-sm space-y-1" style={{ backgroundColor: "var(--ember-soft)" }}>
              <p className="font-semibold" style={{ color: "var(--ember)" }}>Esta acción es permanente.</p>
              <p style={{ color: "var(--ember-2)" }}>
                Se eliminarán todos los beneficios e historial de uso de <strong>{name}</strong>.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Escribe <span className="font-semibold">{name}</span> para confirmar</Label>
              <Input
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                placeholder={name}
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setDeleteDialog(false)}>Cancelar</Button>
              <Button
                className="flex-1 border-0 text-white"
                style={{ backgroundColor: confirmName === name ? "var(--ember)" : undefined }}
                disabled={confirmName !== name || loading}
                onClick={deleteBusiness}
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
