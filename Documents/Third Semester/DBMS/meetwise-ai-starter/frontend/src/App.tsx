import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Database, MessageCircle, Plus, Search, Send, Sparkles, Users, XCircle } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'
type Meeting = { meeting_id: string; title: string; starts_at: string; ends_at: string; status: string; organizer_name?: string; room_name?: string }
type QueryEvent = { id: number; sql: string; parameters: unknown; elapsed_ms: number | null; row_count: number; success: boolean; error?: string }
type User = { user_id: string; full_name: string; email: string }

function startOfWeek(date: Date) {
  const d = new Date(date); d.setHours(0,0,0,0); d.setDate(d.getDate() - ((d.getDay()+6)%7)); return d
}
function fmtTime(s: string) { return new Date(s).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
function fmtDay(d: Date) { return d.toLocaleDateString([], { weekday: 'short', day: 'numeric' }) }

export default function App() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [events, setEvents] = useState<QueryEvent[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [chat, setChat] = useState<{role:'assistant'|'user'; text:string}[]>([
    {role:'assistant', text:'Hi! I can help you find meetings or prepare a new booking. Try “show my meetings” or use New Meeting to book a slot.'}
  ])
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [week, setWeek] = useState(startOfWeek(new Date()))
  const [showModal, setShowModal] = useState(false)
  const [title, setTitle] = useState('')
  const [organizer, setOrganizer] = useState('')
  const [participants, setParticipants] = useState<string[]>([])
  const [starts, setStarts] = useState('')
  const [ends, setEnds] = useState('')
  const [tab, setTab] = useState<'sql'|'results'>('sql')

  async function refresh() {
    try {
      const [m, q, u] = await Promise.all([
        fetch(`${API}/api/meetings`).then(r => r.ok ? r.json() : Promise.reject()),
        fetch(`${API}/api/query-events`).then(r => r.json()),
        fetch(`${API}/api/users`).then(r => r.ok ? r.json() : {users:[]})
      ])
      setMeetings(m.meetings || []); setEvents(q.events || []); setUsers(u.users || [])
    } catch { setError('Backend not connected. Start FastAPI and configure DATABASE_URL to load live data.') }
  }
  useEffect(() => { refresh() }, [])

  const days = useMemo(() => Array.from({length:7}, (_,i) => { const d = new Date(week); d.setDate(d.getDate()+i); return d }), [week])
  const weekMeetings = meetings.filter(m => { const d = new Date(m.starts_at); return d >= week && d < new Date(week.getTime()+7*86400000) })
  const hours = Array.from({length:11}, (_,i) => i+8)

  async function sendChat() {
    if (!message.trim() || busy) return
    const text = message.trim(); setMessage(''); setChat(c => [...c, {role:'user', text}]); setBusy(true)
    try {
      const r = await fetch(`${API}/api/chat`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({message:text})})
      const data = await r.json()
      setChat(c => [...c, {role:'assistant', text: data.reply || data.detail || 'Request completed.'}])
      if (data.data) setChat(c => [...c, {role:'assistant', text: JSON.stringify(data.data, null, 2)}])
      await refresh()
    } catch { setChat(c => [...c, {role:'assistant', text:'I could not reach the backend. Check that FastAPI is running.'}]) }
    finally { setBusy(false) }
  }

  async function createMeeting(e: React.FormEvent) {
    e.preventDefault(); setError('')
    try {
      const r = await fetch(`${API}/api/meetings`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({
        title, organizer_id:organizer, participant_ids:participants, starts_at:new Date(starts).toISOString(), ends_at:new Date(ends).toISOString()
      })})
      const data = await r.json()
      if (!r.ok) throw new Error(typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail))
      setShowModal(false); setTitle(''); setParticipants([]); await refresh()
      setChat(c => [...c, {role:'assistant', text:`Meeting “${title}” created successfully.`}])
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to create meeting.') }
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-icon"><CalendarDays size={21}/></div><div><strong>MeetWise</strong><small>AI SCHEDULER</small></div></div>
      <div className="workspace"><span className="workspace-dot"/> DBMS Project <span className="chevron">⌄</span></div>
      <div className="nav-label">WORKSPACE</div>
      <button className="nav-item active"><CalendarDays size={17}/> Calendar <span className="nav-count">{meetings.length}</span></button>
      <button className="nav-item" onClick={() => setShowModal(true)}><Plus size={17}/> New meeting</button>
      <button className="nav-item" onClick={() => setTab('sql')}><Database size={17}/> SQL inspector</button>
      <div className="sidebar-bottom"><div className="db-status"><span className="status-dot"/> API connection<br/><small>Live database mode</small></div><div className="profile"><div className="avatar">A</div><div><strong>Project Demo</strong><small>Student workspace</small></div></div></div>
    </aside>

    <main className="main">
      <header className="topbar"><div><div className="eyebrow">YOUR WORKSPACE / CALENDAR</div><h1>Meeting calendar</h1><p>Plan together. Let AI handle the scheduling details.</p></div><div className="top-actions"><div className="search"><Search size={16}/><input placeholder="Search meetings..." onChange={e => { const q=e.target.value.toLowerCase(); setMeetings(prev => prev.map(m=>({...m, title:m.title}))); if(q) setMeetings(prev=>prev.filter(m=>m.title.toLowerCase().includes(q))) }}/></div><button className="primary" onClick={() => setShowModal(true)}><Plus size={17}/> New meeting</button></div></header>

      {error && <div className="error-banner"><XCircle size={17}/>{error}<button onClick={() => setError('')}>Dismiss</button></div>}
      <div className="content-grid">
        <section className="calendar-panel">
          <div className="calendar-toolbar"><div><h2>{week.toLocaleDateString([], {month:'long', year:'numeric'})}</h2><span>{weekMeetings.length} meetings this week</span></div><div className="week-controls"><button onClick={()=>setWeek(new Date(week.getTime()-7*86400000))}><ChevronLeft size={18}/></button><button onClick={()=>setWeek(startOfWeek(new Date()))}>Today</button><button onClick={()=>setWeek(new Date(week.getTime()+7*86400000))}><ChevronRight size={18}/></button></div></div>
          <div className="calendar-scroll"><div className="calendar">
            <div className="time-head"></div>{days.map(d=><div className={`day-head ${d.toDateString()===new Date().toDateString()?'today':''}`} key={d.toISOString()}><span>{fmtDay(d).split(' ')[0]}</span><strong>{d.getDate()}</strong></div>)}
            {hours.map(hour=><div className="hour-row" key={hour}><div className="time-label">{hour%12||12} {hour<12?'AM':'PM'}</div>{days.map(d=>{
              const slot=weekMeetings.filter(m=>{const dt=new Date(m.starts_at);return dt.getDate()===d.getDate()&&dt.getMonth()===d.getMonth()&&dt.getHours()===hour})
              return <div className="day-cell" key={d.toISOString()+hour}>{slot.map(m=><div className="meeting-chip" key={m.meeting_id} title={`${m.title} · ${fmtTime(m.starts_at)}–${fmtTime(m.ends_at)}`}><b>{m.title}</b><span>{fmtTime(m.starts_at)} – {fmtTime(m.ends_at)}</span></div>)}</div>
            })}</div>)}
          </div></div>
          <div className="legend"><span><i className="legend-blue"/> Scheduled meeting</span><span><i className="legend-green"/> Database-verified</span><span><i className="legend-orange"/> Conflict checks enabled</span></div>
        </section>

        <aside className="right-column">
          <section className="assistant-panel"><div className="panel-heading"><div className="ai-icon"><Sparkles size={18}/></div><div><h2>MeetWise assistant</h2><span><i className="live-dot"/> Ready to help</span></div><span className="beta">BETA</span></div>
            <div className="chat-messages">{chat.map((c,i)=><div className={`chat-row ${c.role}`} key={i}>{c.role==='assistant'&&<div className="mini-ai"><Sparkles size={13}/></div>}<div className="bubble">{c.text}</div></div>)}{busy&&<div className="bubble typing">Checking request...</div>}</div>
            <div className="suggestions"><button onClick={()=>setMessage('Show my meetings')}>Show my meetings</button><button onClick={()=>setShowModal(true)}>Schedule a meeting</button></div>
            <form className="chat-input" onSubmit={e=>{e.preventDefault();sendChat()}}><input value={message} onChange={e=>setMessage(e.target.value)} placeholder="Ask about your schedule..."/><button disabled={busy||!message.trim()} aria-label="Send"><Send size={16}/></button></form>
            <div className="assistant-foot"><span><Database size={12}/> Database-backed responses</span><span><Clock3 size={12}/> Conflict-aware</span></div>
          </section>
          <section className="query-panel"><div className="panel-heading query-title"><div className="query-icon"><Database size={17}/></div><div><h2>Query inspector</h2><span>SQL transparency mode</span></div><span className="query-live">LIVE</span></div>
            <div className="query-tabs"><button className={tab==='sql'?'selected':''} onClick={()=>setTab('sql')}>Executed SQL</button><button className={tab==='results'?'selected':''} onClick={()=>setTab('results')}>Query history ({events.length})</button></div>
            {tab==='sql' ? <div className="sql-code"><div className="code-meta"><span>POSTGRESQL</span><span>Parameterized query</span></div><pre>{events[0]?.sql || '-- Your executed SQL will appear here.\n-- Try “Show my meetings” in the assistant.'}</pre>{events[0]&&<><div className="code-meta"><span>PARAMETERS</span><span>{events[0].row_count} row(s) · {events[0].elapsed_ms ?? '—'} ms</span></div><pre>{JSON.stringify(events[0].parameters,null,2)}</pre></>}</div> : <div className="history-list">{events.map(ev=><button key={ev.id} onClick={()=>setTab('sql')} className="history-item"><span className={ev.success?'success-dot':'failed-dot'}/><span><b>{ev.sql.split('\n').join(' ').slice(0,74)}</b><small>{ev.row_count} rows · {ev.elapsed_ms ?? '—'} ms</small></span></button>)}{!events.length&&<p className="empty">No queries yet. Interact with the assistant to generate database activity.</p>}</div>}
            <div className="query-footer"><span><span className="status-dot"/> Connected to API</span><button onClick={refresh}>Refresh</button></div>
          </section>
        </aside>
      </div>
      <footer className="footer"><span>MEETWISE AI <b>·</b> DBMS COURSE PROJECT</span><span><Users size={13}/> Relational data <b>·</b> Transactions <b>·</b> Query optimization</span></footer>
    </main>

    {showModal&&<div className="modal-backdrop" onClick={()=>setShowModal(false)}><form className="modal" onSubmit={createMeeting} onClick={e=>e.stopPropagation()}><div className="modal-head"><div><h2>Create a meeting</h2><p>Availability is checked before saving.</p></div><button type="button" onClick={()=>setShowModal(false)}><XCircle size={19}/></button></div>
      <label>Meeting title<input required value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. DBMS project review"/></label>
      <label>Organizer<select required value={organizer} onChange={e=>setOrganizer(e.target.value)}><option value="">Choose organizer</option>{users.map(u=><option key={u.user_id} value={u.user_id}>{u.full_name}</option>)}</select></label>
      <label>Participants<select multiple value={participants} onChange={e=>setParticipants(Array.from(e.target.selectedOptions, o=>o.value))}>{users.filter(u=>u.user_id!==organizer).map(u=><option key={u.user_id} value={u.user_id}>{u.full_name}</option>)}</select><small>Use Ctrl/Cmd to select multiple participants.</small></label>
      <div className="form-row"><label>Starts at<input required type="datetime-local" value={starts} onChange={e=>setStarts(e.target.value)}/></label><label>Ends at<input required type="datetime-local" value={ends} onChange={e=>setEnds(e.target.value)}/></label></div>
      <div className="modal-actions"><button type="button" className="secondary" onClick={()=>setShowModal(false)}>Cancel</button><button className="primary" type="submit">Check & create</button></div>
    </form></div>}
  </div>
}
