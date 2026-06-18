import { useState, useEffect, useRef } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import {
  getCurrentUser,
  getCurrentQuestionnaireId,
  getConversationsForUser,
  getConversationById,
  sendMessage,
} from '../api/mockApi'
import type { Conversation, ChatMessage } from '../types'
import Layout from '../components/Layout'

function AnneMark() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <defs>
        <linearGradient id="am-g" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4f46e5"/><stop offset="1" stopColor="#7c3aed"/>
        </linearGradient>
      </defs>
      <rect width="36" height="36" rx="10" fill="url(#am-g)"/>
      <path d="M11 25L18 11L25 25M14.5 20h7" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function formatTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  return d.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' }) +
    (isToday ? '' : ' · ' + d.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' }))
}

export default function ChatPage() {
  const navigate = useNavigate()
  const user = getCurrentUser()
  const qId = getCurrentQuestionnaireId()
  const [convs, setConvs] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeConv, setActiveConv] = useState<Conversation | null>(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!user) return
    const list = getConversationsForUser(user.id)
    setConvs(list)
    if (list.length > 0 && !activeId) {
      setActiveId(list[0].id)
      setActiveConv(list[0])
    }
  }, [user?.id])

  useEffect(() => {
    if (!activeId) return
    setActiveConv(getConversationById(activeId))
  }, [activeId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConv?.messages.length])

  if (!user) return <Navigate to="/imc" replace />

  if (!qId || convs.length === 0) {
    return (
      <Layout>
        <div className="ch-empty-wrap">
          <div className="ch-empty-card">
            <AnneMark />
            <h2>Messagerie Anne IA</h2>
            <p>Soumettez votre questionnaire médical pour activer votre espace de messagerie sécurisé avec Anne et votre IPS.</p>
            <button className="btn btn-primary" onClick={() => navigate('/questionnaire')}>
              Remplir le questionnaire →
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  function handleSend() {
    if (!text.trim() || !activeId || !user || sending) return
    setSending(true)
    sendMessage(activeId, user.id, `${user.prenom} ${user.nom}`, user.role, text.trim())
    setText('')
    setActiveConv(getConversationById(activeId))
    setTimeout(() => {
      setSending(false)
      inputRef.current?.focus()
    }, 150)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  function selectConv(id: string) {
    setActiveId(id)
    setActiveConv(getConversationById(id))
  }

  const isAnne = (c: Conversation) => c.type === 'patient-anna'

  return (
    <Layout>
      <div className="ch-layout">

        {/* ── Sidebar ───────────────────────────────────────── */}
        <aside className="ch-sidebar">
          <div className="ch-sidebar-head">
            <span className="ch-sidebar-title">Messagerie</span>
            <span className="ch-sidebar-count">{convs.length}</span>
          </div>
          <div className="ch-conv-list">
            {convs.map(c => {
              const last = c.messages[c.messages.length - 1]
              const anne = isAnne(c)
              return (
                <button
                  key={c.id}
                  className={`ch-conv-item${activeId === c.id ? ' active' : ''}`}
                  onClick={() => selectConv(c.id)}
                >
                  <div className={`ch-conv-av${anne ? ' ch-av-anne' : ' ch-av-ips'}`}>
                    {anne ? 'A' : 'IPS'}
                  </div>
                  <div className="ch-conv-meta">
                    <div className="ch-conv-name">
                      {anne ? 'Anne · Assistante IA' : c.participantName}
                    </div>
                    <div className="ch-conv-preview">
                      {last?.content.slice(0, 52) ?? ''}…
                    </div>
                  </div>
                  {anne && <div className="ch-conv-live" title="En ligne" />}
                </button>
              )
            })}
          </div>
        </aside>

        {/* ── Main ─────────────────────────────────────────── */}
        {activeConv ? (
          <div className="ch-main">
            {/* Header */}
            <div className="ch-main-head">
              <div className={`ch-conv-av ch-av-lg${isAnne(activeConv) ? ' ch-av-anne' : ' ch-av-ips'}`}>
                {isAnne(activeConv) ? 'A' : 'IPS'}
              </div>
              <div className="ch-main-head-info">
                <div className="ch-main-head-name">
                  {isAnne(activeConv) ? 'Anne · Assistante IA' : activeConv.participantName}
                </div>
                <div className="ch-main-head-status">
                  {isAnne(activeConv)
                    ? <><span className="ch-dot ch-dot-green" /> Disponible en tout temps</>
                    : <><span className="ch-dot ch-dot-amber" /> Répond sous 24h</>
                  }
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="ch-messages">
              {activeConv.messages.length === 0 && (
                <div className="ch-msg-empty">
                  <p>Commencez la conversation…</p>
                </div>
              )}
              {activeConv.messages.map((msg: ChatMessage) => {
                const isMe = msg.senderId === user.id
                const isAnneMsg = msg.senderRole === 'anna'
                return (
                  <div key={msg.id} className={`ch-msg${isMe ? ' ch-msg-me' : ' ch-msg-them'}`}>
                    {!isMe && (
                      <div className={`ch-bubble-av${isAnneMsg ? ' ch-av-anne' : ' ch-av-ips'}`}>
                        {isAnneMsg ? 'A' : msg.senderName[0]}
                      </div>
                    )}
                    <div className="ch-bubble-wrap">
                      {!isMe && (
                        <div className={`ch-sender-label${isAnneMsg ? ' ch-label-anne' : ' ch-label-ips'}`}>
                          {isAnneMsg ? 'Anne · IA' : msg.senderName}
                        </div>
                      )}
                      <div className={`ch-bubble${isMe ? ' ch-bubble-me' : isAnneMsg ? ' ch-bubble-anne' : ' ch-bubble-ips'}`}>
                        <p>{msg.content}</p>
                      </div>
                      <div className="ch-time">{formatTime(msg.timestamp)}</div>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="ch-input-bar">
              <textarea
                ref={inputRef}
                className="ch-textarea"
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Écrivez votre message… (Entrée pour envoyer)"
                rows={2}
              />
              <button
                className={`ch-send-btn${sending ? ' ch-sending' : ''}`}
                onClick={handleSend}
                disabled={!text.trim() || sending}
                title="Envoyer"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="ch-main ch-main-empty">
            <AnneMark />
            <p>Sélectionnez une conversation</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
