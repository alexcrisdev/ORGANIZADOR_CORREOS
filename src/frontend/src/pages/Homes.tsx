import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AREAS_COMUNES } from "./listados_areas_comunes";
import { apiEndpoint } from "../config";
import '../App.css'

type Dominio = {
    id: number
    name: string
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export function Home() {
    const [name, setName] = useState('')
    const [isActive, setIsActive] = useState(true)
    const [open, setOpen] = useState(false)
    const [openComunes, setOpenComunes] = useState(false)
    const [isClosingComunes, setIsClosingComunes] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editName, setEditName] = useState('')
    const [editIsActive, setEditIsActive] = useState(true)
    const [dominios, setDominios] = useState<Dominio[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetch(apiEndpoint('/api/dominios'))
            .then(response => response.json())
            .then(datos => {
                setDominios(datos)
                setLoading(false)
            })
            .catch(err => {
                console.error('Error al traer dominios:', err)
                setError('Error al cargar los dominios')
                setLoading(false)
            })
    }, []) // [] = ejecuta solo al cargar

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()

        if(!name.trim()){
            alert('El nombre no puede estar vacío')
            return
        }

        const res = await fetch(apiEndpoint('/api/dominios'), {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name, isActive})
        })

        if(!res.ok) {
            alert('Error al crear dominio')
            return
        }

        const nuevo = await res.json()
        setDominios([nuevo, ...dominios])
        setName('')
        setIsActive(true)
        setOpen(false)
    }

    const handleInactivate = async (id: number) => {
        if(!confirm('¿Desactivar este dominio?')) return

        try {
            const res = await fetch(apiEndpoint(`/api/dominios/${id}`), {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({isActive: false})
            })

            if(!res.ok) {
                alert('Error al inactivar dominio')
                return
            }

            // Solo cambiar el estado, no eliminar
            setDominios(dominios.map(d => d.id === id ? {...d, isActive: false} : d))
        } catch(err) {
            console.error('Error:', err)
            alert('Error al inactivar dominio')
        }
    }

    const handleDelete = async (id: number) => {
        if(!confirm('¿Eliminar permanentemente este dominio? No se podrá recuperar.')) return

        try {
            const res = await fetch(apiEndpoint(`/api/dominios/${id}`), {
                method: 'DELETE'
            })

            if(!res.ok) {
                alert('Error al eliminar dominio')
                return
            }

            setDominios(dominios.filter(d => d.id !== id))
        } catch(err) {
            console.error('Error:', err)
            alert('Error al eliminar dominio')
        }
    }

    const handleOpenEdit = (dominio: Dominio) => {
        setEditingId(dominio.id)
        setEditName(dominio.name)
        setEditIsActive(dominio.isActive)
        setOpenEdit(true)
    }

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault()

        if(!editName.trim()) {
            alert('El nombre no puede estar vacío')
            return
        }

        try {
            const res = await fetch(apiEndpoint(`/api/dominios/${editingId}`), {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({name: editName.trim(), isActive: editIsActive})
            })

            if(!res.ok) {
                alert('Error al actualizar dominio')
                return
            }

            const actualizado = await res.json()
            setDominios(dominios.map(d => d.id === editingId ? actualizado : d))
            setOpenEdit(false)
            setEditingId(null)
        } catch(err) {
            console.error('Error:', err)
            alert('Error al actualizar dominio')
        }
    }

    const handleCloseComunes = () => {
        setIsClosingComunes(true)
        setTimeout(() => {
            setOpenComunes(false)
            setIsClosingComunes(false)
        }, 300)
    }

    if(loading) return <div className="app"><p>Cargando dominios...</p></div>
    if(error) return <div className="app"><p style={{color: 'red'}}>{error}</p></div>

    return (
        <div className="app">
            <header className="hero">
                <div className="hero__badge">Panel de dominios</div>
                <h1 className="hero__title">Dominios registrados</h1>
                <p className="hero__subtitle">
                    Selecciona un dominio para ver sus áreas y correos asociados.
                </p>
                <div className="hero__actions">
                    <button className="btn btn--primary" onClick={() => setOpen(true)}>
                        Crear dominio 
                    </button>
                    <button className="btn btn--ghost" onClick={() => setOpenComunes(true)}>Ver áreas comunes</button>
                </div>
            </header>

            {open && (
                <div className="drawer-backdrop" onClick={() => setOpen(false)}>
                    <aside className="drawer" onClick={(e) => e.stopPropagation()}>
                        <div className="drawer__header">
                            <h2>Nuevo dominio</h2>
                            <button className="drawer__close" onClick={() => setOpen(false)}>X</button>
                        </div>
                        <form className="drawer__form" onSubmit={handleCreate}>
                            <label className="drawer__label">
                                Nombre del dominio
                                <input 
                                    className="drawer__input" 
                                    placeholder="ej: gmail.com"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </label>

                            <label className="drawer__toggle">
                                <input 
                                    type="checkbox" 
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)} />
                                Activo
                            </label>

                        <div className="drawer__actions">
                            <button type="button" className="btn btn--ghost" onClick={() => setOpen(false)}>
                            Cancelar
                            </button>
                            <button type="submit" className="btn btn--primary">
                            Guardar
                            </button>
                        </div>
                        </form>
                    </aside>
                </div>
            )}

            {openEdit && (
                <div className="drawer-backdrop" onClick={() => setOpenEdit(false)}>
                    <aside className="drawer" onClick={(e) => e.stopPropagation()}>
                        <div className="drawer__header">
                            <h2>Editar dominio</h2>
                            <button className="drawer__close" onClick={() => setOpenEdit(false)}>X</button>
                        </div>
                        <form className="drawer__form" onSubmit={handleSaveEdit}>
                            <label className="drawer__label">
                                Nombre del dominio
                                <input 
                                    className="drawer__input" 
                                    placeholder="ej: gmail.com"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                />
                            </label>

                            <label className="drawer__toggle">
                                <input 
                                    type="checkbox" 
                                    checked={editIsActive}
                                    onChange={(e) => setEditIsActive(e.target.checked)} />
                                Activo
                            </label>

                        <div className="drawer__actions">
                            <button type="button" className="btn btn--ghost" onClick={() => setOpenEdit(false)}>
                            Cancelar
                            </button>
                            <button type="submit" className="btn btn--primary">
                            Guardar cambios
                            </button>
                        </div>
                        </form>
                    </aside>
                </div>
            )}

            {openComunes && (
                <div className="drawer-backdrop" onClick={handleCloseComunes} style={{animation: isClosingComunes ? 'fadeOut 0.3s ease forwards' : 'fadeIn 0.2s ease'}}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{animation: isClosingComunes ? 'slideDown 0.3s ease forwards' : 'slideUp 0.3s ease'}}>
                        <div className="modal__header">
                            <h2>Áreas Comunes</h2>
                            <button className="drawer__close" onClick={handleCloseComunes}>X</button>
                        </div>
                        <div className="modal__content">
                            <p className="modal__subtitle">
                                Estas son las áreas comunes disponibles para usar en tus dominios:
                            </p>
                            <div className="modal__grid">
                                {AREAS_COMUNES.map((area, idx) => (
                                    <div key={idx} className="modal__item">
                                        {area}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <section className="grid">
                {dominios.map((dominio) => (
                    <article key={dominio.id} className="card">
                        <h2 className="card__title">{dominio.name}</h2>
                        <div className="card__footer">
                            <p className="card__description">
                                {dominio.isActive ? '✓ Activo' : '✗ Inactivo'}
                            </p>
                        </div>
                        <div style={{display: 'flex', gap: '8px'}}>
                            {dominio.isActive ? (
                                <>
                                    <Link
                                        to={`/dominio/${dominio.id}`}
                                        className="btn btn--outline"
                                        style={{ textAlign: 'center', textDecoration: 'none', flex: 1}}
                                    >
                                        Entrar
                                    </Link>
                                    <button
                                        className="btn btn--outline"
                                        onClick={() => handleOpenEdit(dominio)}
                                        style={{flex: 1}}
                                    >
                                        Editar
                                    </button>
                                    <button
                                        className="btn btn--outline"
                                        onClick={() => handleInactivate(dominio.id)}
                                        style={{flex: 1}}
                                    >
                                        Inactivar
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        className="btn btn--outline"
                                        onClick={() => handleOpenEdit(dominio)}
                                        style={{flex: 1}}
                                    >
                                        Editar
                                    </button>
                                    <button
                                        className="btn btn--outline"
                                        onClick={() => handleDelete(dominio.id)}
                                        style={{flex: 1}}
                                    >
                                        Eliminar
                                    </button>
                                </>
                            )}
                        </div>
                    </article>
                ))}
            </section>
        </div>
    )
}