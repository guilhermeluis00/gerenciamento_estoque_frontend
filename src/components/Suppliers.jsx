import { useCallback, useEffect, useState } from 'react';
import { Mail, Pencil, Phone, Plus, Trash2, Truck } from 'lucide-react';
import { api } from '../api';
import { formatDocument } from '../format';
import { LIMITS, documentChars, phoneChars } from '../limits';
import Modal from './Modal';
import Field from './ui/Field';
import { useFeedback } from './ui/Feedback';
import { EmptyState, SkeletonList } from './ui/States';

const emptyForm = { name: '', email: '', phone: '', document: '' };

export default function Suppliers() {
  const { toast, confirm } = useFeedback();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() =>
    api.getSuppliers()
      .then(setSuppliers)
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false)), []);

  useEffect(() => { load(); }, [load]);

  const update = (field, transform) => (e) => {
    const value = transform ? transform(e.target.value) : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  function openForm(supplier) {
    setForm(supplier ? {
      name: supplier.name,
      email: supplier.email || '',
      phone: supplier.phone || '',
      document: formatDocument(supplier.document),
    } : emptyForm);
    setEditingId(supplier?.id || null);
    setFormError('');
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      if (editingId) {
        await api.updateSupplier(editingId, form);
        toast('Fornecedor atualizado');
      } else {
        await api.createSupplier(form);
        toast('Fornecedor cadastrado');
      }
      setShowForm(false);
      load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(supplier) {
    const count = supplier._count?.products || 0;
    const ok = await confirm({
      title: `Excluir o fornecedor "${supplier.name}"?`,
      message: count > 0 ? `${count} produto(s) ficarão sem fornecedor.` : undefined,
      confirmLabel: 'Excluir',
      danger: true,
    });
    if (!ok) return;
    try {
      await api.deleteSupplier(supplier.id);
      toast('Fornecedor excluído');
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Fornecedores</h1>
        <button onClick={() => openForm(null)}><Plus size={16} /> Novo fornecedor</button>
      </div>

      {loadError && <div className="alert alert-error">{loadError}</div>}

      {showForm && (
        <Modal onClose={() => setShowForm(false)}>
          <form className="modal-form" onSubmit={handleSubmit}>
            <h2>{editingId ? 'Editar fornecedor' : 'Novo fornecedor'}</h2>
            {formError && <div className="alert alert-error">{formError}</div>}

            <Field label="Nome" max={LIMITS.SUPPLIER_NAME} value={form.name} onChange={update('name')} required autoFocus />
            <div className="form-row">
              <Field label="E-mail" optional type="email" max={LIMITS.EMAIL} value={form.email} onChange={update('email')} autoComplete="off" />
              <Field
                label="Telefone" optional type="tel" max={LIMITS.PHONE} value={form.phone} onChange={update('phone', phoneChars)}
                placeholder="(11) 99999-9999"
              />
            </div>
            <Field
              label="CPF/CNPJ" optional max={LIMITS.DOCUMENT} value={form.document} onChange={update('document', documentChars)}
              hint="Os dígitos verificadores são conferidos ao salvar" spellCheck={false}
            />

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
              <button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
            </div>
          </form>
        </Modal>
      )}

      {loading ? <SkeletonList rows={3} /> : suppliers.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="Nenhum fornecedor"
          text="Cadastre fornecedores para vinculá-los aos produtos."
          action={<button onClick={() => openForm(null)}><Plus size={16} /> Cadastrar fornecedor</button>}
        />
      ) : (
        <table className="responsive-table">
          <thead><tr><th>Fornecedor</th><th>Contato</th><th>CPF/CNPJ</th><th className="num">Produtos</th><th></th></tr></thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.id}>
                <td data-label="Fornecedor" className="cell-title">{s.name}</td>
                <td data-label="Contato">
                  {s.email || s.phone ? (
                    <div className="contact-links">
                      {s.email && <a href={`mailto:${s.email}`}><Mail size={14} /> {s.email}</a>}
                      {s.phone && <a href={`tel:${s.phone.replace(/[^\d+]/g, '')}`}><Phone size={14} /> {s.phone}</a>}
                    </div>
                  ) : <span className="text-muted">—</span>}
                </td>
                <td data-label="CPF/CNPJ">{formatDocument(s.document) || <span className="text-muted">—</span>}</td>
                <td data-label="Produtos" className="num">{s._count?.products ?? 0}</td>
                <td className="table-actions">
                  <button className="btn-link" onClick={() => openForm(s)}><Pencil size={14} /> Editar</button>
                  <button className="btn-link btn-danger" onClick={() => handleDelete(s)}><Trash2 size={14} /> Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
