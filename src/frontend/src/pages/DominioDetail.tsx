import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useToast } from "../hooks/useToast";
import { AREAS_COMUNES } from "./listados_areas_comunes";
import { apiEndpoint } from "../config";
import '../App.css'

type AreaDominio = {
    areaId: number
    dominioId: number
}

type Area = {
    id: number
    name: string
    areaDominios: AreaDominio[]
}

type Dominio = {
    id: number
    name: string
}


export function DominioDetail() {
    const {id} = useParams<{id: string}>()
    const {showToast} = useToast()
    const dominioId = parseInt(id || '0')

    const [open, setOpen] = useState(false)
    const [areaSeleccionada, setAreaSeleccionada] = useState('')
    const [areaNueva, setAreaNueva] = useState('')
    const [openEdit, setOpenEdit] = useState(false)
    const [editingAreaId, setEditingAreaId] = useState<number | null>(null)
    const [editAreaName, setEditAreaName] = useState('')
    const [areas, setAreas] = useState<Area[]>([])
    const [dominio, setDominio] = useState<Dominio | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        //Traer áreas
        Promise.all([
            fetch(apiEndpoint('/api/areas')).then(r => r.json()),
            fetch(apiEndpoint(`/api/dominios/${dominioId}`)).then(r => r.json())
        ])
          .then(([areasData, dominioData]) => {
            setAreas(areasData)
            setDominio(dominioData)
            setLoading(false)
          })
          .catch(err => {
            console.error('Error:', err)
            setError('Error al cargar los datos')
            setLoading(false)
          })
    }, [dominioId])

    const handleCreateArea = async(e: React.FormEvent) => {
        e.preventDefault()

        const nombreArea = areaSeleccionada === 'nueva' ? areaNueva : areaSeleccionada

        if(!nombreArea.trim()) {
            showToast('El nombre no puede estar vacío', 'warning')
            return
        }

        const res = await fetch(apiEndpoint('/api/areas'), {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                name: nombreArea,
                dominios: [dominioId]
            })
        })

        if(!res.ok) {
            showToast('Error al crear área', 'error')
            return
        }

        const nueva = await res.json()
        setAreas([nueva, ...areas])
        setAreaSeleccionada('')
        setAreaNueva('')
        setOpen(false)
    }

    const handleDeleteArea = async(areaId: number) => {
        if(!confirm('¿Eliminar esta área? Se borrarán todos los correos asociados')) return

        try {
            const res = await fetch(apiEndpoint(`/api/areas/${areaId}`), {
                method: 'DELETE'
            })

            if(!res.ok) {
                showToast('Error al eliminar área', 'error')
                return
            }

            setAreas(areas.filter(a => a.id !== areaId))
        } catch(err) {
            console.error('Error:', err)
            showToast('Error al eliminar área', 'error')
        }
    }

    const handleOpenEdit = (area: Area) => {
        setEditingAreaId(area.id)
        setEditAreaName(area.name)
        setOpenEdit(true)
    }

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault()

        if(!editAreaName.trim()) {
            showToast('El nombre no puede estar vacío', 'warning')
            return
        }

        try {
            const res = await fetch(apiEndpoint(`/api/areas/${editingAreaId}`), {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({name: editAreaName.trim()})
            })

            if(!res.ok) {
                showToast('Error al actualizar área', 'error')
                return
            }

            const actualizado = await res.json()
            setAreas(areas.map(a => a.id === editingAreaId ? actualizado : a))
            setOpenEdit(false)
            setEditingAreaId(null)
        } catch(err) {
            console.error('Error:', err)
            showToast('Error al actualizar área', 'error')
        }
    }

    //Filtrar áreas que pertenecen a este dominio
    const areasDelDominio = areas.filter(area => 
        area.areaDominios.some(ad => ad.dominioId === dominioId)
    )

    if(loading) return <div className="app"><p>Cargando...</p></div>
    if(error) return <div className="app"><p style={{color:'red'}}>{error}</p></div>
    if(!dominio) return <div className="app"><p>Dominio no encontrado</p></div>

    return (
        <div className="app">
            <header className="hero">
                <Link to='/' className="hero__badge" style={{ textDecoration: 'none' }}>
                    ← Volver
                </Link>
                <h1 className="hero__title">Áreas - {dominio.name}</h1>
                <p className="hero__subtitle">
                    Selecciona un área para ver sus correos asociados.
                </p>
                <div className="hero__actions">
                    <button className="btn btn--primary" onClick={() => setOpen(true)}>
                        Vincular área
                    </button>
                </div>
            </header>

            {open && (
                <div className="drawer-backdrop" onClick={() => setOpen(false)}>
                    <aside className="drawer" onClick={(e) => e.stopPropagation()}>
                        <div className="drawer__header">
                            <h2>Vincular área</h2>
                            <button className="drawer__close" onClick={() => setOpen(false)}>X</button>
                        </div>

                        <form className="drawer__form" onSubmit={handleCreateArea}>
                            <label className="drawer__label">
                                Selecciona un área
                                <select 
                                    className="drawer__input"
                                    value={areaSeleccionada}
                                    onChange={(e) => setAreaSeleccionada(e.target.value)}
                                >
                                    <option value="">--Elegir--</option>
                                    {AREAS_COMUNES.map(area => (
                                        <option key={area} value={area}>
                                            {area}
                                        </option>
                                    ))}
                                    <option value="nueva">+ Crear nueva</option>
                                </select>
                            </label>

                            {areaSeleccionada === 'nueva' && (
                                <label className="drawer__label">
                                    Nombre del Área
                                    <input 
                                        className="drawer__input"
                                        placeholder="ej: Marketing"
                                        value={areaNueva}
                                        onChange={(e) => setAreaNueva(e.target.value)}
                                    />
                                </label>
                            )}

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
                            <h2>Editar área</h2>
                            <button className="drawer__close" onClick={() => setOpenEdit(false)}>X</button>
                        </div>
                        <form className="drawer__form" onSubmit={handleSaveEdit}>
                            <label className="drawer__label">
                                Nombre del área
                                <input 
                                    className="drawer__input"
                                    placeholder="ej: Marketing"
                                    value={editAreaName}
                                    onChange={(e) => setEditAreaName(e.target.value)}
                                />
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

            <section className="grid">
                {areasDelDominio.length > 0 ? (
                    areasDelDominio.map((area) => (
                        <article key={area.id} className="card">
                            <h2 className="card__title">{area.name}</h2>
                            <div className="card__footer">
                                <p className="card__description">
                                    Área vinculada
                                </p>
                            </div>
                            <div style={{display: 'flex', gap: '8px'}}>
                                <Link
                                    to={`/dominio/${dominioId}/area/${area.id}`}
                                    className="btn btn--outline"
                                    style={{textAlign: 'center', textDecoration: 'none', flex: 1}}
                                >
                                    Entrar
                                </Link>
                                <button
                                    className="btn btn--outline"
                                    onClick={() => handleOpenEdit(area)}
                                    style={{flex: 1}}
                                >
                                    Editar
                                </button>
                                <button
                                    className="btn btn--outline"
                                    onClick={() => handleDeleteArea(area.id)}
                                    style={{flex: 1}}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </article>
                    ))
                ) : (
                    <p>No hay áreas vinculadas a este dominio</p>
                )}
            </section>
        </div>
    )
}