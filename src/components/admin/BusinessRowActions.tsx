"use client"

import { useState } from "react"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MoreHorizontal, Eye, EyeOff, Loader2, Trash2, KeyRound, Pencil, UserPlus, Copy, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { revalidateBenefitsCache } from "@/app/admin/benefits/actions"

interface Props {
  businessId: string
  isActive: boolean
  accessCode: string | null
  ownerUserId: string | null
  name: string
  category: string | null
  address: string | null
  wazeUrl: string | null
  phone: string | null
  description: string | null
}

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
}

export default function BusinessRowActions({
  businessId, isActive, accessCode, ownerUserId, name,
  category, address, wazeUrl, phone, description,
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [portalDialog, setPortalDialog] = useState(false)
  const [portalEmail, setPortalEmail] = useState("")
  const [portalPassword, setPortalPassword] = useState(generatePassword())
  const [portalLoading, setPortalLoading] = useState(false)
  const [portalCreated, setPortalCreated] = useState(false)
  const [portalCopied, setPortalCopied] = useState(false)

  const [codeDialog, setCodeDialog] = useState(false)
  const [newCode, setNewCode] = useState(accessCode ?? "")

  const [editDialog, setEditDialog] = useState(false)
  const [editForm, setEditForm] = useState({ name, category: category ?? "", address: address ?? "", waze_url: wazeUrl ?? "", phone: phone ?? "", description: description ?? "" })

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
      waze_url: editForm.waze_url.trim() || null,
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

  async function createPortalAccess(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!portalEmail.trim()) { toast.error("Ingresa el email del comercio"); return }
    setPortalLoading(true)
    try {
      const res = await fetch("/api/admin/business-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business_id: businessId, email: portalEmail.trim(), password: portalPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Error al crear el acceso")
        setPortalLoading(false)
        return
      }
      setPortalCreated(true)
      router.refresh()
    } catch {
      toast.error("Error de conexión. Intenta de nuevo.")
    }
    setPortalLoading(false)
  }

  function copyPortalCredentials() {
    navigator.clipboard.writeText(`Email: ${portalEmail}\nContraseña: ${portalPassword}`)
    setPortalCopied(true)
    setTimeout(() => setPortalCopied(false), 2000)
  }

  async function deleteBusiness() {
    setLoading(true)
    const supabase = createClient()

    // Deactivate all benefits for this business first
    const { error: benefitsError } = await supabase
      .from("benefits")
      .update({ is_active: false })
      .eq("partner_business_id", businessId)

    if (benefitsError) {
      toast.error("Error al desactivar los beneficios del comercio")
      setLoading(false)
      return
    }

    const { error } = await supabase.from("partner_businesses").delete().eq("id", businessId)
    if (error) {
      toast.error("Error al eliminar el comercio")
    } else {
      await revalidateBenefitsCache()
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
          <DropdownMenuItem onClick={() => { setEditForm({ name, category: category ?? "", address: address ?? "", waze_url: wazeUrl ?? "", phone: phone ?? "", description: description ?? "" }); setEditDialog(true) }}>
            <Pencil className="w-4 h-4 mr-2" />Editar datos
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => { setNewCode(accessCode ?? ""); setCodeDialog(true) }}>
            <KeyRound className="w-4 h-4 mr-2" />Cambiar código
          </DropdownMenuItem>
          {!ownerUserId && (
            <DropdownMenuItem onClick={() => {
              setPortalEmail(""); setPortalPassword(generatePassword())
              setPortalCreated(false); setPortalDialog(true)
            }}>
              <UserPlus className="w-4 h-4 mr-2" />Crear acceso al portal
            </DropdownMenuItem>
          )}
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
              <Input value={editForm.address} onChange={(e) => setEditForm(p => ({ ...p, address: e.target.value }))} placeholder="Ej: Calle 50, San Francisco, Panamá" />
            </div>
            <div className="space-y-2">
              <Label>Link de Waze</Label>
              <Input value={editForm.waze_url} onChange={(e) => setEditForm(p => ({ ...p, waze_url: e.target.value }))} placeholder="https://ul.waze.com/ul?venue_id=..." />
              <p className="text-xs" style={{ color: "var(--mute)" }}>Pega el link que comparte Waze al hacer "Compartir lugar". Tiene prioridad sobre la dirección.</p>
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

      {/* ── PORTAL ACCESS DIALOG ────────────────────────── */}
      <Dialog open={portalDialog} onOpenChange={setPortalDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Crear acceso al portal</DialogTitle>
          </DialogHeader>
          {!portalCreated ? (
            <form onSubmit={createPortalAccess} className="space-y-4">
              <div className="space-y-2">
                <Label>Email del comercio</Label>
                <Input
                  type="email"
                  value={portalEmail}
                  onChange={(e) => setPortalEmail(e.target.value)}
                  placeholder="contacto@comercio.com"
                  autoFocus
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Contraseña temporal</Label>
                <Input value={portalPassword} readOnly className="font-mono tracking-wide" />
                <p className="text-xs" style={{ color: "var(--mute)" }}>
                  Se genera automáticamente. Cópiala y pásasela al comercio por WhatsApp.
                </p>
              </div>
              <div className="flex gap-3 pt-1">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setPortalDialog(false)}>Cancelar</Button>
                <Button type="submit" className="flex-1 gradient-brand border-0 text-white" disabled={portalLoading}>
                  {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Crear acceso"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl p-4 text-sm space-y-1" style={{ backgroundColor: "rgba(47,143,110,0.1)" }}>
                <p className="font-semibold" style={{ color: "var(--verde)" }}>Cuenta creada</p>
                <p style={{ color: "var(--midnight)" }}>Guarda estos datos ahora — la contraseña no se vuelve a mostrar.</p>
              </div>
              <div className="rounded-xl p-3 space-y-1 font-mono text-sm" style={{ backgroundColor: "var(--bone-2)" }}>
                <p>Email: {portalEmail}</p>
                <p>Contraseña: {portalPassword}</p>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={copyPortalCredentials}>
                  {portalCopied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {portalCopied ? "Copiado" : "Copiar"}
                </Button>
                <Button type="button" className="flex-1 gradient-brand border-0 text-white" onClick={() => setPortalDialog(false)}>
                  Listo
                </Button>
              </div>
            </div>
          )}
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
