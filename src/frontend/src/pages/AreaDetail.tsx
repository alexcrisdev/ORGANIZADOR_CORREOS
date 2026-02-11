import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { apiEndpoint } from '../config'
import '../App.css'

type Correo = {
  id: number
  email: string
  password?: string
  areaId: number
  dominioId: number
}

type Area = {
  id: number
  name: string
}

type Dominio = {
  id: number
  name: string
}

export function AreaDetail() {
  const { id, areaId } = useParams<{ id: string; areaId: string }>()
  const dominioId = parseInt(id || '0')
  const areId = parseInt(areaId || '0')

  const [correos, setCorreos] = useState<Correo[]>([])
  const [area, setArea] = useState<Area | null>(null)
  const [dominio, setDominio] = useState<Dominio | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [open, setOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [localPart, setLocalPart] = useState('')
  const [password, setPassword] = useState('')
  const [openEdit, setOpenEdit] = useState(false)
  const [isClosingEdit, setIsClosingEdit] = useState(false)
  const [editingCorreoId, setEditingCorreoId] = useState<number | null>(null)
  const [editLocalPart, setEditLocalPart] = useState('')
  const [editPassword, setEditPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [copiedType, setCopiedType] = useState<'email' | 'password' | null>(null)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  useEffect(() => {
    // Traer correos, área y dominio
    Promise.all([
      fetch(apiEndpoint('/api/correos')).then(r => r.json()),
      fetch(apiEndpoint(`/api/areas/${areId}`)).then(r => r.json()),
      fetch(apiEndpoint(`/api/dominios/${dominioId}`)).then(r => r.json())
    ])
      .then(([correosData, areaData, dominioData]) => {
        setCorreos(correosData)
        setArea(areaData)
        setDominio(dominioData)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error:', err)
        setError('Error al cargar los datos')
        setLoading(false)
      })
  }, [dominioId, areId])

  // Filtrar correos por área y dominio
  const correosDelArea = correos.filter(c => c.areaId === areId && c.dominioId === dominioId)

  //Crea correo
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()

    if(!localPart.trim()) {
      alert('El nombre del correo es obligatorio')
      return
    }

    if(!password.trim()) {
      alert('La contraseña es obligatoria')
      return
    }

    try {
      const response = await fetch(apiEndpoint('/api/correos'), {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          localPart: localPart.trim(),
          password: password.trim(),
          areaId: areId,
          dominioId: dominioId
        })
      })

      if(!response.ok){
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear el correo')
      }

      const nuevoCorreo = await response.json()
      setCorreos([...correos, nuevoCorreo])
      setLocalPart('')
      setPassword('')
      setOpen(false)
    } catch(err) {
      console.error('Error:', err)
      alert(err instanceof Error ? err.message : 'Error al crear el correo')
    }
  }

  const handleDeleteCorreo = async(correoId: number) => {
    if(!confirm('¿Eliminar este correo?')) return

    try {
      const res = await fetch(apiEndpoint(`/api/correos/${correoId}`), {
        method: 'DELETE'
      })

      if(!res.ok) {
        alert('Error al eliminar correo')
        return
      }

      setCorreos(correos.filter(c => c.id !== correoId))
    } catch(err) {
      console.error('Error:', err)
      alert('Error al eliminar correo')
    }
  }

  const handleOpenEdit = (correo: Correo) => {
    setEditingCorreoId(correo.id)
    setEditLocalPart(correo.email.split('@')[0])
    setEditPassword(correo.password || '')
    setOpenEdit(true)
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()

    if(!editLocalPart.trim()) {
      alert('El nombre del correo es obligatorio')
      return
    }

    const body: any = {
      localPart: editLocalPart.trim()
    }

    if(editPassword.trim()) {
      body.password = editPassword.trim()
    }

    try {
      const res = await fetch(apiEndpoint(`/api/correos/${editingCorreoId}`), {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
      })

      if(!res.ok) {
        alert('Error al actualizar correo')
        return
      }

      const actualizado = await res.json()
      setCorreos(correos.map(c => c.id === editingCorreoId ? actualizado : c))
      setOpenEdit(false)
      setEditingCorreoId(null)
    } catch(err) {
      console.error('Error:', err)
      alert('Error al actualizar correo')
    }
  }

  const handleCopy = async (text: string, type: 'email' | 'password', correoId: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedType(type)
      setCopiedId(correoId)

      setTimeout(() => {
        setCopiedType(null)
        setCopiedId(null)
      }, 2000)
    } catch(err) {
      console.error('Error al copiar:', err)
      alert('Error al copiar')
    }
  }

  const handleCloseDrawer = () => {
    setIsClosing(true)
    setTimeout(() => {
      setOpen(false)
      setIsClosing(false)
    }, 250)
  }

  const handleCloseEdit = () => {
    setIsClosingEdit(true)
    setTimeout(() => {
      setOpenEdit(false)
      setIsClosingEdit(false)
    }, 250)
  }

  if (loading) return <div className='app'><p>Cargando...</p></div>
  if (error) return <div className='app'><p style={{ color: 'red' }}>{error}</p></div>
  if (!area || !dominio) return <div className='app'><p>Datos no encontrados</p></div>

  return (
    <div className='app'>
      <header className='hero'>
        <Link to={`/dominio/${dominioId}`} className='hero__badge' style={{ textDecoration: 'none' }}>
          ← Volver
        </Link>
        <h1 className='hero__title'>Correos - {area.name} ({dominio.name})</h1>
        <p className='hero__subtitle'>
          Listado de correos en esta área.
        </p>
        <button className='btn btn--primary' onClick={() => setOpen(true)}>
          Crear correo
        </button>
      </header>

      <section className='grid'>
        {correosDelArea.length > 0 ? (
          correosDelArea.map((correo) => (
            <article key={correo.id} className='card'>
              <h2 className='card__title'>{correo.email}</h2>
              <div className='card__footer'>
                <p className='card__description'>
                  {copiedId === correo.id && copiedType === 'email' 
                    ? '✓ Email copiado' 
                    : copiedId === correo.id && copiedType === 'password'
                    ? '✓ Contraseña copiada'
                    : '✓ Activo'}
                </p>
              </div>
              <div style={{display: 'flex', gap: '8px'}}>
                <button 
                  className='btn btn--outline'
                  onClick={() => handleCopy(correo.email, 'email', correo.id)}
                  style={{flex: 1}}
                  title='Copiar email'
                >
                  📋
                </button>
                <button 
                  className='btn btn--outline'
                  onClick={() => correo.password && handleCopy(correo.password, 'password', correo.id)}
                  style={{flex: 1, opacity: correo.password ? 1 : 0.5}}
                  title='Copiar contraseña'
                  disabled={!correo.password}
                >
                  🔑
                </button>
                <button 
                  className='btn btn--outline'
                  onClick={() => handleOpenEdit(correo)}
                  style={{flex: 1}}
                >
                  Editar
                </button>
                <button 
                  className='btn btn--outline'
                  onClick={() => handleDeleteCorreo(correo.id)}
                  style={{flex: 1}}
                >
                  Eliminar
                </button>
              </div>
            </article>
          ))
        ) : (
          <p>No hay correos en esta área</p>
        )}
      </section>

      {/*Drawer para crear correo*/}
      {open && (
        <div className='drawer-backdrop' onClick={handleCloseDrawer} style={{animation: isClosing ? 'fadeOut 0.25s ease forwards' : 'fadeIn 0.2s ease'}}>
          <aside className='drawer' onClick={(e) => e.stopPropagation()} style={{animation: isClosing ? 'slideOut 0.25s ease forwards' : 'slideIn 0.25s ease'}}>
            <div className='drawer__header'>
              <h2>Crear nuevo correo</h2>
              <button className='drawer__close' onClick={handleCloseDrawer}>X</button>
            </div>

            <form className='drawer__form' onSubmit={handleCreate}>
              <label className='drawer__label'>
                Nombre del correo
                <input
                  type="text" 
                  className='drawer__input'
                  placeholder='Ejemplo: ventas1, sistemas2'
                  value={localPart}
                  onChange={(e) => setLocalPart(e.target.value)}
                  autoFocus
                />
                <p className='form-hint'>
                  Solo la parte antes del @. Ejemplo: "ventas1"
                </p>
              </label>

              <label className='drawer__label'>
                Contraseña
                <input
                  type="password" 
                  className='drawer__input'
                  placeholder='Ingresa la contraseña'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>

              {/*Vista previa del mail*/}
              {localPart && (
                <label className='drawer__label'>
                  Vista previa
                  <div className='form-preview'>
                    {localPart}@{dominio.name}
                  </div>
                </label>
              )}

              <div className='drawer__actions'>
                <button 
                  type='button'
                  className='btn btn--ghost'
                  onClick={handleCloseDrawer}
                >
                  Cancelar
                </button>
                <button type='submit' className='btn btn--primary'>
                  Crear correo
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}

      {/*Drawer para editar correo*/}
      {openEdit && (
        <div className='drawer-backdrop' onClick={handleCloseEdit} style={{animation: isClosingEdit ? 'fadeOut 0.25s ease forwards' : 'fadeIn 0.2s ease'}}>
          <aside className='drawer' onClick={(e) => e.stopPropagation()} style={{animation: isClosingEdit ? 'slideOut 0.25s ease forwards' : 'slideIn 0.25s ease'}}>
            <div className='drawer__header'>
              <h2>Editar correo</h2>
              <button className='drawer__close' onClick={handleCloseEdit}>X</button>
            </div>

            <form className='drawer__form' onSubmit={handleSaveEdit}>
              <label className='drawer__label'>
                Nombre del correo
                <input
                  type="text" 
                  className='drawer__input'
                  placeholder='Ejemplo: ventas1'
                  value={editLocalPart}
                  onChange={(e) => setEditLocalPart(e.target.value)}
                  autoFocus
                />
                <p className='form-hint'>
                  Solo la parte antes del @
                </p>
              </label>

              <label className='drawer__label'>
                Contraseña
                <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className='drawer__input'
                    placeholder='Contraseña del correo'
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    style={{paddingRight: '40px'}}
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '18px',
                      padding: '0'
                    }}
                    title={showPassword ? 'Ocultar' : 'Mostrar'}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                <p className='form-hint'>
                  Modifica si quieres cambiar la contraseña
                </p>
              </label>

              {/*Vista previa del mail*/}
              {editLocalPart && (
                <label className='drawer__label'>
                  Vista previa
                  <div className='form-preview'>
                    {editLocalPart}@{dominio.name}
                  </div>
                </label>
              )}

              <div className='drawer__actions'>
                <button 
                  type='button'
                  className='btn btn--ghost'
                  onClick={handleCloseEdit}
                >
                  Cancelar
                </button>
                <button type='submit' className='btn btn--primary'>
                  Guardar cambios
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}
    </div>
  )
}