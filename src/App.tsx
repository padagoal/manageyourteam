import { useEffect, useRef, useState } from 'react'
import type { ReactElement } from 'react'

type Status = 'success' | 'warning' | 'danger'

type PersonRole = {
  id: string
  personName: string
  title: string
  department: string
  status: Status
  x: number
  y: number
  keyResponsibilities: string
  keyMetrics: string
  scope: string
}

type Connection = { id: string; fromId: string; toId: string }

const STATUS_PALETTE: Record<Status, { body: string; header: string; headerText: string; border: string }> = {
  success: { body: '#CDF4D3', header: '#9BE7A7', headerText: '#111827', border: '#9BE7A7' },
  warning: { body: '#FFECBD', header: '#F9D372', headerText: '#111827', border: '#F9D372' },
  danger: { body: '#F59985', header: '#F96746', headerText: '#FFFFFF', border: '#F96746' },
}

const departmentOrderPreferred = [
  'Leadership',
  'Management',
  'Onboarding',
  'Sales/Marketing',
  'Account Management',
  'Operations',
  'Product',
  'Engineering',
  'Design',
  'Marketing',
  'Finance',
  'IT',
  'Legal',
]

const initialData: PersonRole[] = [
  {
    id: 'p1',
    personName: 'Sofia',
    title: 'HR',
    department: 'Leadership',
    status: 'success',
    x: 80,
    y: 140,
    keyResponsibilities: 'Recruiting, onboarding, culture',
    keyMetrics: 'Time-to-hire, eNPS',
    scope: 'Company-wide HR processes',
  },
  {
    id: 'p2',
    personName: 'Rodrigo',
    title: 'Head of Sales',
    department: 'Sales/Marketing',
    status: 'warning',
    x: 520,
    y: 120,
    keyResponsibilities: 'Pipeline, forecasting, closing',
    keyMetrics: 'Win rate, CAC payback',
    scope: 'New business + partnerships',
  },
  {
    id: 'p3',
    personName: 'Sebastian',
    title: 'Customer Success Manager',
    department: 'Account Management',
    status: 'danger',
    x: 900,
    y: 240,
    keyResponsibilities: 'Retention, QBRs, renewals',
    keyMetrics: 'NRR, churn, escalations resolved',
    scope: 'Post-sales relationship',
  },
  {
    id: 'p4',
    personName: 'Camila',
    title: 'Onboarding Manager',
    department: 'Onboarding',
    status: 'success',
    x: 260,
    y: 340,
    keyResponsibilities: 'Kickoffs, implementation plans, training',
    keyMetrics: 'TTFV, implementation satisfaction',
    scope: 'From contract signed to go-live',
  },
  {
    id: 'p5',
    personName: 'Diego',
    title: 'Sales Ops',
    department: 'Sales/Marketing',
    status: 'warning',
    x: 620,
    y: 350,
    keyResponsibilities: 'CRM hygiene, reporting, tooling',
    keyMetrics: 'Forecast accuracy, data completeness',
    scope: 'Support sales processes and data',
  },
  {
    id: 'p6',
    personName: 'Lucia',
    title: 'Product Manager',
    department: 'Product',
    status: 'success',
    x: 1040,
    y: 80,
    keyResponsibilities: 'Roadmap, discovery, prioritization',
    keyMetrics: 'Feature adoption, NPS',
    scope: 'Own product area outcomes',
  },
  {
    id: 'p7',
    personName: 'Mateo',
    title: 'Engineering Lead',
    department: 'Engineering',
    status: 'success',
    x: 60,
    y: 520,
    keyResponsibilities: 'Delivery, code quality, hiring',
    keyMetrics: 'Lead time, change failure rate',
    scope: 'Owns web platform squad',
  },
  {
    id: 'p8',
    personName: 'Valentina',
    title: 'Finance Manager',
    department: 'Finance',
    status: 'warning',
    x: 440,
    y: 520,
    keyResponsibilities: 'Budgeting, AP/AR, reporting',
    keyMetrics: 'Runway, gross margin',
    scope: 'Company financial operations',
  },
  {
    id: 'p9',
    personName: 'Nicolas',
    title: 'Operations Manager',
    department: 'Operations',
    status: 'danger',
    x: 820,
    y: 520,
    keyResponsibilities: 'Logistics, fulfillment SLAs',
    keyMetrics: 'On-time rate, cost per order',
    scope: '3PL coordination and warehouses',
  },
  {
    id: 'p10',
    personName: 'Ana',
    title: 'Design Lead',
    department: 'Design',
    status: 'success',
    x: 1200,
    y: 520,
    keyResponsibilities: 'Brand, UI systems, assets',
    keyMetrics: 'Design velocity, quality reviews',
    scope: 'Design ops and component library',
  },
  {
    id: 'p11',
    personName: 'Pedro',
    title: 'IT Administrator',
    department: 'IT',
    status: 'warning',
    x: 1240,
    y: 280,
    keyResponsibilities: 'Access control, security, devices',
    keyMetrics: 'MTTR, security incidents',
    scope: 'Company-wide IT support',
  },
  {
    id: 'p12',
    personName: 'Mariana',
    title: 'Growth Marketer',
    department: 'Marketing',
    status: 'success',
    x: 300,
    y: 120,
    keyResponsibilities: 'Campaigns, content, lifecycle',
    keyMetrics: 'MQLs, conversion rate',
    scope: 'Owns email + paid channels',
  },
  {
    id: 'p13',
    personName: 'Javier',
    title: 'Legal Counsel',
    department: 'Legal',
    status: 'success',
    x: 1080,
    y: 380,
    keyResponsibilities: 'Contracts, compliance, risk',
    keyMetrics: 'Contract cycle time, issues',
    scope: 'Commercial and privacy matters',
  },
]

// Placeholder to keep type reference if needed in the future
// const defaultConnections: Connection[] = []

function useDragZoom() {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const isPanningRef = useRef(false)
  const lastRef = useRef({ x: 0, y: 0 })

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const factor = e.deltaY > 0 ? 0.9 : 1.1
    setZoom((z) => Math.min(2.2, Math.max(0.4, z * factor)))
  }

  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-node]')) return
    isPanningRef.current = true
    lastRef.current = { x: e.clientX, y: e.clientY }
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isPanningRef.current) return
    const dx = e.clientX - lastRef.current.x
    const dy = e.clientY - lastRef.current.y
    lastRef.current = { x: e.clientX, y: e.clientY }
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }))
  }

  const onMouseUp = () => {
    isPanningRef.current = false
  }

  return { zoom, pan, setPan, onWheel, onMouseDown, onMouseMove, onMouseUp }
}

// Removed StatusBadge to simplify card footer

export default function App() {
  const [nodes, setNodes] = useState<PersonRole[]>(initialData)
  const [connections, setConnections] = useState<Connection[]>([])
  const [statusModal, setStatusModal] = useState<{ id: string; next: Status } | null>(null)
  const [reason, setReason] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [createData, setCreateData] = useState<{
    personName: string
    title: string
    department: string
    status: Status
    keyResponsibilities: string
    keyMetrics: string
    scope: string
  }>({ personName: '', title: '', department: '', status: 'success', keyResponsibilities: '', keyMetrics: '', scope: '' })
  const draggingIdRef = useRef<string | null>(null)
  const dragOffsetRef = useRef({ x: 0, y: 0 })
  const [connectDrag, setConnectDrag] = useState<{ fromId: string; x: number; y: number } | null>(null)
  const [connectHoverId, setConnectHoverId] = useState<string | null>(null)

  const { zoom, pan, onWheel, onMouseDown, onMouseMove, onMouseUp } = useDragZoom()
  const zoomRef = useRef(1)
  useEffect(() => {
    zoomRef.current = zoom
  }, [zoom])

  const startDrag = (e: React.MouseEvent, id: string) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    draggingIdRef.current = id
    dragOffsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    e.stopPropagation()
  }

  const onCanvasMouseMove = (e: React.MouseEvent) => {
    onMouseMove(e)
    const canvasRect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    if (draggingIdRef.current) {
      const id = draggingIdRef.current
      const x = (e.clientX - canvasRect.left - dragOffsetRef.current.x - pan.x) / zoom
      const y = (e.clientY - canvasRect.top - dragOffsetRef.current.y - pan.y) / zoom
      setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, x, y } : n)))
    }
    if (connectDrag) {
      const x = (e.clientX - canvasRect.left - pan.x) / zoom
      const y = (e.clientY - canvasRect.top - pan.y) / zoom
      setConnectDrag((d) => (d ? { ...d, x, y } : d))
    }
  }

  const onCanvasMouseUp = () => {
    draggingIdRef.current = null
    onMouseUp()
    if (connectDrag) {
      const fromId = connectDrag.fromId
      const toId = connectHoverId
      setConnectDrag(null)
      setConnectHoverId(null)
      if (toId && toId !== fromId) {
        setConnections((prev) => {
          if (prev.some((c) => c.fromId === fromId && c.toId === toId)) return prev
          const id = 'c_' + Math.random().toString(36).slice(2, 9)
          return [...prev, { id, fromId, toId }]
        })
      }
    }
  }

  const changeStatus = (id: string, next: Status) => {
    setStatusModal({ id, next })
    setReason('')
  }

  const confirmStatus = () => {
    if (!statusModal) return
    setNodes((prev) => prev.map((n) => (n.id === statusModal.id ? { ...n, status: statusModal.next } : n)))
    // In a real app, persist `reason` to history/audit log
    setStatusModal(null)
  }

  // Arrange by department (columns) helper
  const arrangeByDepartment = () => {
    const presentDepartments = Array.from(new Set(nodes.map((n) => n.department)))
    const orderedDepartments = presentDepartments
      .slice()
      .sort((a, b) => {
        const ia = departmentOrderPreferred.indexOf(a)
        const ib = departmentOrderPreferred.indexOf(b)
        if (ia !== -1 && ib !== -1) return ia - ib
        if (ia !== -1) return -1
        if (ib !== -1) return 1
        return a.localeCompare(b)
      })

    const columnXStart = 80
    const columnSpacing = 460
    const rowYStart = 110
    const rowSpacing = 260

    const deptToIndex = Object.fromEntries(orderedDepartments.map((d, i) => [d, i])) as Record<string, number>

    const next = nodes
      .slice()
      .sort((a, b) => a.personName.localeCompare(b.personName))
      .map((n, _, all) => {
        const columnIndex = deptToIndex[n.department] ?? 0
        const siblings = all
          .filter((x) => x.department === n.department)
          .sort((a, b) => a.personName.localeCompare(b.personName))
        const rowIndex = siblings.findIndex((s) => s.id === n.id)
        const x = columnXStart + columnIndex * columnSpacing
        const y = rowYStart + rowIndex * rowSpacing
        return { ...n, x, y }
      })

    setNodes(next)
  }

  // Auto apply on first load and after creating a node
  useEffect(() => {
    arrangeByDepartment()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Track node sizes to anchor connectors to card edges
  const [nodeSizes, setNodeSizes] = useState<Record<string, { w: number; h: number }>>({})
  const makeMeasureRef = (id: string) => (el: HTMLDivElement | null) => {
    if (!el) return
    const apply = () => {
      const rect = el.getBoundingClientRect()
      const scale = zoomRef.current || 1
      setNodeSizes((prev) => {
        const cur = prev[id]
        const w = rect.width / scale
        const h = rect.height / scale
        if (cur && cur.w === w && cur.h === h) return prev
        return { ...prev, [id]: { w, h } }
      })
    }
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(el)
    ;(el as any).__ro = ro
  }

  const getRightAnchor = (id: string) => {
    const n = nodes.find((x) => x.id === id)
    if (!n) return { x: 0, y: 0 }
    const s = nodeSizes[id]
    return { x: n.x + (s?.w ?? 420), y: n.y + ((s?.h ?? 220) / 2) }
  }

  const getLeftAnchor = (id: string) => {
    const n = nodes.find((x) => x.id === id)
    if (!n) return { x: 0, y: 0 }
    const s = nodeSizes[id]
    return { x: n.x, y: n.y + ((s?.h ?? 220) / 2) }
  }

  const startConnectFrom = (fromId: string) => {
    const { x, y } = getRightAnchor(fromId)
    setConnectDrag({ fromId, x, y })
  }

  // Keyboard shortcut: N to open the create modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'n' || e.key === 'N') && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement | null
        const isEditable = !!target?.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]')
        if (!isEditable && !createOpen && !statusModal) {
          e.preventDefault()
          setCreateOpen(true)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [createOpen, statusModal])

  const NodeCard = ({ n }: { n: PersonRole }) => {
    const colors = STATUS_PALETTE[n.status]
    return (
      <div
        data-node
        onMouseDown={(e) => startDrag(e, n.id)}
        onMouseEnter={() => {
          if (connectDrag && connectDrag.fromId !== n.id) setConnectHoverId(n.id)
        }}
        onMouseLeave={() => {
          if (connectHoverId === n.id) setConnectHoverId(null)
        }}
        className="group absolute select-none rounded-2xl shadow-sm"
        style={{ left: n.x, top: n.y, width: 420, backgroundColor: colors.body, border: `2px solid ${colors.border}` }}
        ref={makeMeasureRef(n.id)}
      >
        <div
          className="mx-6 mt-6 rounded-xl px-5 py-3 font-semibold text-center"
          style={{ backgroundColor: colors.header, color: colors.headerText }}
        >
          {n.personName} — {n.title}
        </div>
        <div className="p-6">
          <div className="rounded-xl border bg-white/80 p-5 text-sm text-gray-800 grid gap-5">
            <div>
              <div className="font-semibold text-center mb-1">Overview</div>
              <div className="text-center">Owning the post-sales relationships, customer retention, support</div>
            </div>
            <div>
              <div className="font-semibold mb-1">Reporting Metrics</div>
              <div>Churn Rate</div>
              <div>NRR</div>
              <div>Number of clients escalations / Issues resolved</div>
            </div>
            <div>
              <div className="font-semibold mb-1">Scope</div>
              <div>Managing post-sales relationships with customers</div>
              <div>Building and leading the custom success team</div>
              <div>Acting as internal voice of the customers for the Credit and Product Team</div>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-4">
            <div className="relative">
              <select
                className="rounded-lg text-sm font-semibold pl-3 pr-8 py-1.5 shadow-sm border-0 appearance-none"
                style={{ backgroundColor: colors.header, color: colors.headerText }}
                value={n.status}
                onChange={(e) => changeStatus(n.id, e.target.value as Status)}
              >
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="danger">Danger</option>
              </select>
              <svg
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ color: colors.headerText }}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
            {/* footer right badge removed */}
          </div>
        </div>
        {/* Connect handle (appears on hover) */}
        <button
          aria-label="Create connection"
          onMouseDown={(e) => {
            e.stopPropagation()
            startConnectFrom(n.id)
          }}
          className="absolute right-[-10px] top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-gray-900 text-white grid place-items-center shadow cursor-crosshair opacity-0 group-hover:opacity-100"
          title="Drag to another card to connect"
        >
          +
        </button>
      </div>
    )
  }

  const ConnectionSvg = () => {
    // Manual connections created by the user
    const manual: ReactElement[] = []
    for (const c of connections) {
      const a = getRightAnchor(c.fromId)
      const b = getLeftAnchor(c.toId)
      const mid = (a.x + b.x) / 2
      manual.push(
        <path
          key={c.id}
          d={`M ${a.x} ${a.y} C ${mid} ${a.y}, ${mid} ${b.y}, ${b.x} ${b.y}`}
          className="stroke-gray-300"
          strokeWidth={3}
          fill="none"
          vectorEffect="non-scaling-stroke"
          shapeRendering="geometricPrecision"
        />
      )
    }

    // Temporary connection while dragging
    if (connectDrag) {
      const a = getRightAnchor(connectDrag.fromId)
      const b = { x: connectDrag.x, y: connectDrag.y }
      const mid = (a.x + b.x) / 2
      manual.push(
        <path
          key="__temp__"
          d={`M ${a.x} ${a.y} C ${mid} ${a.y}, ${mid} ${b.y}, ${b.x} ${b.y}`}
          className="stroke-gray-400"
          strokeDasharray="6 4"
          strokeWidth={2}
          fill="none"
          vectorEffect="non-scaling-stroke"
          shapeRendering="geometricPrecision"
        />
      )
    }

    // Compute department-based connections between adjacent columns, index-aligned
    const departments = Array.from(new Set(nodes.map((n) => n.department)))
      .sort((a, b) => {
        const ia = departmentOrderPreferred.indexOf(a)
        const ib = departmentOrderPreferred.indexOf(b)
        if (ia !== -1 && ib !== -1) return ia - ib
        if (ia !== -1) return -1
        if (ib !== -1) return 1
        return a.localeCompare(b)
      })

    const columns = departments.map((d) => nodes.filter((n) => n.department === d).sort((a, b) => a.personName.localeCompare(b.personName)))

    const rendered: ReactElement[] = [...manual]

    for (let i = 0; i < columns.length - 1; i++) {
      const colA = columns[i]
      const colB = columns[i + 1]
      const pairCount = Math.min(colA.length, colB.length)
      for (let j = 0; j < pairCount; j++) {
        const a = colA[j]
        const b = colB[j]
        const sa = nodeSizes[a.id]
        const sb = nodeSizes[b.id]
        const ax = a.x + (sa?.w ?? 420)
        const ay = a.y + ((sa?.h ?? 220) / 2)
        const bx = b.x
        const by = b.y + ((sb?.h ?? 220) / 2)
        const mid = (ax + bx) / 2
          rendered.push(
            <path
              key={`${a.id}-${b.id}`}
              d={`M ${ax} ${ay} C ${mid} ${ay}, ${mid} ${by}, ${bx} ${by}`}
              className="stroke-gray-300"
              strokeWidth={2}
              fill="none"
              vectorEffect="non-scaling-stroke"
              shapeRendering="geometricPrecision"
            />
          )
      }
    }

    return <g>{rendered}</g>
  }

  function DepartmentHeaders({ nodes }: { nodes: PersonRole[] }) {
    const groups = nodes.reduce<Record<string, PersonRole[]>>((acc, n) => {
      ;(acc[n.department] ||= []).push(n)
      return acc
    }, {})

    const ordered = Object.entries(groups).sort(([a], [b]) => {
      const ia = departmentOrderPreferred.indexOf(a)
      const ib = departmentOrderPreferred.indexOf(b)
      if (ia !== -1 && ib !== -1) return ia - ib
      if (ia !== -1) return -1
      if (ib !== -1) return 1
      return a.localeCompare(b)
    })

  return (
    <>
        {ordered.map(([dept, list]) => {
          list.sort((a, b) => a.x - b.x || a.y - b.y)
          const first = list[0]
          // Determine worst status for dept: danger > warning > success
          const status: Status = list.some((n) => n.status === 'danger')
            ? 'danger'
            : list.some((n) => n.status === 'warning')
            ? 'warning'
            : 'success'
          const colors = STATUS_PALETTE[status]
          return (
            <div
              key={dept}
              className="absolute rounded-md px-3 py-1 font-semibold text-sm shadow-sm"
              style={{ left: first.x, top: Math.max(20, first.y - 40), backgroundColor: colors.header, color: colors.headerText, border: `1px solid ${colors.border}` }}
            >
              {dept}
            </div>
          )
        })}
      </>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center justify-between px-4 py-2 border-b bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="text-xl font-semibold">ManageYourTeam.biz</div>
          <span className="text-sm text-gray-600">Drag, connect, zoom. Colors: Green=Success, Yellow=Warning, Red=Danger.</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <button className="px-2 py-1 rounded border bg-white" onClick={arrangeByDepartment}>Arrange by department</button>
          <span>Zoom: {(zoom * 100).toFixed(0)}%</span>
        </div>
      </header>

      <div
        className="relative flex-1 overflow-hidden bg-[radial-gradient(circle_at_1px_1px,#e5e7eb_1px,transparent_1px)]"
        style={{ backgroundSize: '24px 24px' }}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onCanvasMouseMove}
        onMouseUp={onCanvasMouseUp}
      >
        <div
          className="absolute inset-0 origin-top-left"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
        >
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ overflow: 'visible' }}>
            <ConnectionSvg />
          </svg>
          {/* Department headers */}
          <DepartmentHeaders nodes={nodes} />
          {nodes.map((n) => (
            <NodeCard key={n.id} n={n} />
          ))}
        </div>
      </div>

      {statusModal && (
        <div className="fixed inset-0 bg-black/30 grid place-items-center z-20" onClick={() => setStatusModal(null)}>
          <div className="bg-white rounded-lg shadow-xl w-[28rem]" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 py-3 border-b font-semibold">Reason for status change</div>
            <div className="p-4 grid gap-3">
              <div className="text-sm text-gray-700">
                Changing to <b>{statusModal.next}</b>. Please note why:
              </div>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Short reason..."
                className="w-full h-28 rounded-md border p-2 text-sm"
              />
              <div className="flex justify-end gap-2">
                <button className="px-3 py-1.5 text-sm rounded border" onClick={() => setStatusModal(null)}>Cancel</button>
                <button className="px-3 py-1.5 text-sm rounded bg-gray-900 text-white" onClick={confirmStatus} disabled={!reason.trim()}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button (bottom-left) */}
      <div className="fixed left-5 bottom-5 z-30">
        <button
          aria-label="Add card (N)"
          className="h-12 w-12 rounded-full bg-gray-900 text-white shadow-lg flex items-center justify-center"
          onClick={() => setCreateOpen(true)}
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
        <div className="text-[10px] text-gray-600 mt-1">Press N</div>
      </div>

      {/* Create Card Modal */}
      {createOpen && (
        <div className="fixed inset-0 bg-black/30 grid place-items-center z-40" onClick={() => setCreateOpen(false)}>
          <div
            className="rounded-2xl shadow-xl w-[40rem]"
            style={{ backgroundColor: '#CDF4D3', border: '2px solid #9BE7A7' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="mx-6 mt-6 rounded-xl px-5 py-3 font-semibold text-center"
              style={{ backgroundColor: '#9BE7A7', color: '#111827' }}
            >
              {createData.personName || 'New Person'} — {createData.title || 'Role'}
            </div>
            <form
              className="p-6"
              onSubmit={(e) => {
                e.preventDefault()
                if (!createData.personName.trim() || !createData.title.trim()) return
                const id = 'p' + Math.random().toString(36).slice(2, 9)
                const newNode: PersonRole = {
                  id,
                  personName: createData.personName.trim(),
                  title: createData.title.trim(),
                  department: createData.department.trim() || '—',
                  status: createData.status,
                  x: Math.round(120 + Math.random() * 240),
                  y: Math.round(120 + Math.random() * 200),
                  keyResponsibilities: createData.keyResponsibilities.trim(),
                  keyMetrics: createData.keyMetrics.trim(),
                  scope: createData.scope.trim(),
                }
                setNodes((prev) => [...prev, newNode])
                // After creating, arrange into columns
                setTimeout(arrangeByDepartment, 0)
                setCreateOpen(false)
                setCreateData({ personName: '', title: '', department: '', status: 'success', keyResponsibilities: '', keyMetrics: '', scope: '' })
              }}
            >
              <div className="rounded-xl border bg-white/80 p-5 grid grid-cols-2 gap-3 text-sm text-gray-800">
                <label className="grid gap-1">
                  <span className="text-gray-700">Person Name</span>
                  <input
                    className="rounded-md border px-2 py-1"
                    value={createData.personName}
                    onChange={(e) => setCreateData((d) => ({ ...d, personName: e.target.value }))}
                    required
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-gray-700">Title</span>
                  <input
                    className="rounded-md border px-2 py-1"
                    value={createData.title}
                    onChange={(e) => setCreateData((d) => ({ ...d, title: e.target.value }))}
                    required
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-gray-700">Department</span>
                  <input
                    className="rounded-md border px-2 py-1"
                    value={createData.department}
                    onChange={(e) => setCreateData((d) => ({ ...d, department: e.target.value }))}
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-gray-700">Status</span>
                  <select
                    className="rounded-md border px-2 py-1"
                    value={createData.status}
                    onChange={(e) => setCreateData((d) => ({ ...d, status: e.target.value as Status }))}
                  >
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="danger">Danger</option>
                  </select>
                </label>
              </div>
              <div className="p-5 rounded-xl border bg-white/80 mt-4 grid gap-3 text-sm text-gray-800">
                <label className="grid gap-1">
                  <span className="text-gray-700">Key Responsibilities</span>
                  <textarea
                    className="rounded-md border px-2 py-1 h-16"
                    value={createData.keyResponsibilities}
                    onChange={(e) => setCreateData((d) => ({ ...d, keyResponsibilities: e.target.value }))}
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-gray-700">Key Metrics</span>
                  <textarea
                    className="rounded-md border px-2 py-1 h-16"
                    value={createData.keyMetrics}
                    onChange={(e) => setCreateData((d) => ({ ...d, keyMetrics: e.target.value }))}
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-gray-700">Scope</span>
                  <textarea
                    className="rounded-md border px-2 py-1 h-16"
                    value={createData.scope}
                    onChange={(e) => setCreateData((d) => ({ ...d, scope: e.target.value }))}
                  />
                </label>
                <div className="flex justify-end gap-2 pt-1">
                  <button type="button" className="px-3 py-1.5 text-sm rounded border" onClick={() => setCreateOpen(false)}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-sm rounded bg-gray-900 text-white disabled:opacity-50"
                    disabled={!createData.personName.trim() || !createData.title.trim()}
                  >
                    Create
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
