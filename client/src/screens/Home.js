import React, { useEffect, useState } from 'react';
import { Form, useActionData, useNavigation } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const LOADING_STEPS = ['Uploading file', 'Extracting text', 'AI analyzing (Groq)', 'Finalizing results'];

function toTitle(s) {
  const str = String(s || '').trim();
  if (!str) return '';
  return str
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function LoadingSteps({ active }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!active) {
      setIdx(0);
      return;
    }

    const t = setInterval(() => {
      setIdx((v) => Math.min(LOADING_STEPS.length - 1, v + 1));
    }, 1200);

    return () => clearInterval(t);
  }, [active]);

  if (!active) return null;

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ fontWeight: 900 }}>Working…</div>
        <div className="muted" style={{ fontSize: 13 }}>This can take a few seconds.</div>
      </div>
      <div style={{ marginTop: 10 }}>
        {LOADING_STEPS.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: i === 0 ? 0 : 8 }}>
            <div
              className={i === idx ? 'spinner' : 'dot'}
              style={{ width: 14, height: 14 }}
              aria-hidden
            />
            <div style={{ fontWeight: 700, opacity: i <= idx ? 1 : 0.55 }}>{s}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export async function uploadResumeAction({ request }) {
  const formData = await request.formData();

  try {
    const res = await fetch(`${BACKEND_URL}/api/resumes/upload`, {
      method: 'POST',
      body: formData,
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        success: false,
        error: json?.error || 'Upload failed',
      };
    }

    return json;
  } catch (e) {
    return {
      success: false,
      error: `Backend not reachable at ${BACKEND_URL}. Start server on :5000 and allow CORS for this origin.`,
    };
  }
}

export default function Home() {
  const actionData = useActionData();
  const nav = useNavigation();

  const isSubmitting = nav.state === 'submitting';

  const [jobDescription, setJobDescription] = useState('');

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
  });

  const fileName = acceptedFiles?.[0]?.name;

  const analysis = actionData?.success ? actionData.data : null;

  const primary = analysis?.groq?.ok ? analysis.groq.data : analysis;

  const groqStatus = analysis?.groq
    ? analysis.groq.ok
      ? 'Groq: OK'
      : 'Groq: OFF/FAILED'
    : 'Groq: OFF';

  return (
    <div className="page">
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Upload Resume for Analysis</div>
        <div className="muted">
          Upload a PDF/DOCX resume and get structured extraction + AI-powered suggestions.
        </div>
        <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>{groqStatus}</div>
      </div>

      <Form method="post" encType="multipart/form-data">
        <div className="card" style={{ marginTop: 18 }}>
          <div
            {...getRootProps()}
            style={{
              border: '2px dashed rgba(255,255,255,0.18)',
              borderRadius: 14,
              padding: 18,
              cursor: 'pointer',
              background: isDragActive ? 'rgba(255,255,255,0.06)' : 'transparent',
            }}
          >
            <input {...getInputProps({ name: 'resume' })} />
            <div style={{ fontSize: 16, fontWeight: 800 }}>Drag & drop PDF/DOCX, or click to select</div>
            <div className="muted" style={{ marginTop: 8 }}>
              {fileName ? `Selected: ${fileName}` : 'No file selected'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 12, alignItems: 'center' }}>
            <button type="submit" disabled={isSubmitting || !acceptedFiles?.length} className="btn">
              {isSubmitting ? 'Analyzing…' : 'Analyze Resume'}
            </button>
            <div className="muted" style={{ fontSize: 13 }}>
              Tip: keep the file under a few MB for fastest processing.
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 8 }}>Job Description (optional)</div>
          <textarea
            name="jobDescription"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here to compute a real AI match score and missing keywords"
            rows={7}
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.14)',
              background: 'rgba(0,0,0,0.25)',
              color: '#e6edf3',
              resize: 'vertical',
            }}
          />
          <div className="muted" style={{ fontSize: 13, marginTop: 8 }}>
            If you leave this empty, Job Match will be skipped.
          </div>
        </div>
      </Form>

      <LoadingSteps active={isSubmitting} />

      {actionData?.success === false ? (
        <div className="card" style={{ marginTop: 16, borderColor: 'rgba(255, 107, 107, 0.35)' }}>
          <div style={{ color: '#ff6b6b', fontWeight: 800 }}>Error</div>
          <div className="muted" style={{ marginTop: 6 }}>
            {toTitle(actionData.error)}
          </div>
        </div>
      ) : null}

      {analysis ? (
        <div style={{ marginTop: 16 }}>
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 10 }}>Analysis (Groq-first)</div>
                <div className="row">
                  <div className="col-6">
                    <div className="muted" style={{ fontSize: 12 }}>Name</div>
                    <div style={{ fontWeight: 800 }}>{primary?.name || '—'}</div>
                  </div>
                  <div className="col-6">
                    <div className="muted" style={{ fontSize: 12 }}>Email</div>
                    <div style={{ fontWeight: 800 }}>{primary?.email || '—'}</div>
                  </div>
                  <div className="col-6">
                    <div className="muted" style={{ fontSize: 12 }}>Phone</div>
                    <div style={{ fontWeight: 800 }}>{primary?.phone || '—'}</div>
                  </div>
                  <div className="col-6">
                    <div className="muted" style={{ fontSize: 12 }}>Skills found</div>
                    <div style={{ fontWeight: 800 }}>{(primary?.skills || []).length}</div>
                  </div>
                </div>

                <div style={{ marginTop: 14 }}>
                  <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Skills</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {(primary?.skills || []).length ? (
                      primary.skills.map((s) => (
                        <span key={s} className="badge">{s}</span>
                      ))
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {analysis?.groq?.ok ? (
              <div className="col-12">
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ fontSize: 18, fontWeight: 900 }}>Groq Output</div>
                    <div className="muted" style={{ fontSize: 13 }}>Model: {analysis.groq.model}</div>
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <div className="muted" style={{ fontSize: 12 }}>Summary</div>
                    <div style={{ marginTop: 6 }}>{analysis.groq.data?.summary || '—'}</div>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <div className="muted" style={{ fontSize: 12 }}>Suggestions</div>
                    <div style={{ marginTop: 6 }}>
                      {(analysis.groq.data?.suggestions || []).length ? (
                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                          {analysis.groq.data.suggestions.map((x) => (
                            <li key={x}>{x}</li>
                          ))}
                        </ul>
                      ) : (
                        <div className="muted">—</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="col-12">
                <div className="card">
                  <div style={{ fontSize: 18, fontWeight: 900 }}>Groq Output</div>
                  <div className="muted" style={{ marginTop: 6 }}>
                    Groq is not enabled or the key is missing. Set `server/.env` with `GROQ_API_KEY` and `GROQ_ENABLED=true`.
                  </div>
                </div>
              </div>
            )}

            {primary?.ats ? (
              <div className="col-12">
                <div className="card">
                  <div style={{ fontSize: 18, fontWeight: 900 }}>ATS Health</div>
                  <div style={{ marginTop: 8 }}>
                    <strong>Score:</strong> {primary.ats.score ?? '—'}
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <div className="muted" style={{ fontSize: 12 }}>Issues</div>
                    {(primary.ats.issues || []).length ? (
                      <ul style={{ margin: 0, paddingLeft: 18, marginTop: 6 }}>
                        {primary.ats.issues.map((x) => (
                          <li key={x}>{x}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="muted" style={{ marginTop: 6 }}>—</div>
                    )}
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <div className="muted" style={{ fontSize: 12 }}>Format warnings</div>
                    {(primary.ats.formatWarnings || []).length ? (
                      <ul style={{ margin: 0, paddingLeft: 18, marginTop: 6 }}>
                        {primary.ats.formatWarnings.map((x) => (
                          <li key={x}>{x}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="muted" style={{ marginTop: 6 }}>—</div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            {primary?.jobMatch ? (
              <div className="col-12">
                <div className="card">
                  <div style={{ fontSize: 18, fontWeight: 900 }}>Job Match (AI)</div>
                  <div style={{ marginTop: 8 }}>
                    <strong>Score:</strong> {primary.jobMatch.score ?? '—'}
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <div className="muted" style={{ fontSize: 12 }}>Matched keywords</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                      {(primary.jobMatch.matchedKeywords || []).length ? (
                        primary.jobMatch.matchedKeywords.map((s) => (
                          <span key={s} className="badge">{s}</span>
                        ))
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </div>
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <div className="muted" style={{ fontSize: 12 }}>Missing keywords</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                      {(primary.jobMatch.missingKeywords || []).length ? (
                        primary.jobMatch.missingKeywords.map((s) => (
                          <span key={s} className="badge">{s}</span>
                        ))
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </div>
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <div className="muted" style={{ fontSize: 12 }}>Recommendations</div>
                    {(primary.jobMatch.recommendations || []).length ? (
                      <ul style={{ margin: 0, paddingLeft: 18, marginTop: 6 }}>
                        {primary.jobMatch.recommendations.map((x) => (
                          <li key={x}>{x}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="muted" style={{ marginTop: 6 }}>—</div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            {(primary?.careerGaps || []).length ? (
              <div className="col-12">
                <div className="card">
                  <div style={{ fontSize: 18, fontWeight: 900 }}>Career Gaps</div>
                  <ul style={{ margin: 0, paddingLeft: 18, marginTop: 10 }}>
                    {primary.careerGaps.map((g, idx) => (
                      <li key={`${g.start}-${g.end}-${idx}`}>
                        <strong>{g.start || '—'}</strong> → <strong>{g.end || '—'}</strong>
                        {g.months !== null ? ` (${g.months} months)` : ''}
                        {g.note ? ` — ${g.note}` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}

            {(primary?.experience || []).length ? (
              <div className="col-12">
                <div className="card">
                  <div style={{ fontSize: 18, fontWeight: 900 }}>Experience</div>
                  <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
                    {primary.experience.map((e, idx) => (
                      <div key={`${e.company}-${e.title}-${idx}`} className="card" style={{ padding: 12 }}>
                        <div style={{ fontWeight: 900 }}>
                          {e.title || '—'}{e.company ? ` · ${e.company}` : ''}
                        </div>
                        <div className="muted" style={{ marginTop: 4, fontSize: 13 }}>
                          {e.start || '—'} → {e.end || '—'}
                        </div>
                        {(e.highlights || []).length ? (
                          <ul style={{ margin: 0, paddingLeft: 18, marginTop: 8 }}>
                            {e.highlights.map((h) => (
                              <li key={h}>{h}</li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {(primary?.projects || []).length ? (
              <div className="col-12">
                <div className="card">
                  <div style={{ fontSize: 18, fontWeight: 900 }}>Projects</div>
                  <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
                    {primary.projects.map((p, idx) => (
                      <div key={`${p.name}-${idx}`} className="card" style={{ padding: 12 }}>
                        <div style={{ fontWeight: 900 }}>{p.name || '—'}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                          {(p.tech || []).map((t) => (
                            <span key={t} className="badge">{t}</span>
                          ))}
                        </div>
                        {(p.highlights || []).length ? (
                          <ul style={{ margin: 0, paddingLeft: 18, marginTop: 8 }}>
                            {p.highlights.map((h) => (
                              <li key={h}>{h}</li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {(primary?.education || []).length ? (
              <div className="col-12">
                <div className="card">
                  <div style={{ fontSize: 18, fontWeight: 900 }}>Education</div>
                  <ul style={{ margin: 0, paddingLeft: 18, marginTop: 10 }}>
                    {primary.education.map((ed, idx) => (
                      <li key={`${ed.school}-${ed.degree}-${idx}`}>
                        <strong>{ed.school || '—'}</strong>
                        {ed.degree ? ` — ${ed.degree}` : ''}
                        <span className="muted"> {` (${ed.start || '—'} → ${ed.end || '—'})`}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}

          </div>
        </div>
      ) : null}
    </div>
  );
}
