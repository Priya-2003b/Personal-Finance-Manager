import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [type, setType] = useState('expense');
  const [budget, setBudget] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('expense');
  const [editBudget, setEditBudget] = useState('');
  const [isFixed, setIsFixed] = useState(false);
  const [parentId, setParentId] = useState('');

  const fetchCategories = () => {
    setLoading(true);
    api.get('/categories')
      .then((res) => setCategories(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load categories.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    setError('');
    api.post('/categories', {
  name: newName.trim(),
  type,
  budget: Number(budget) || 0,
  isFixed,
  parentId: parentId || null
  })
      .then(() => {
        setSuccess('Category added successfully.');
        setNewName('');
        setType('expense');
        setBudget('');
        fetchCategories();
        setTimeout(() => setSuccess(''), 3000);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to add category.'))
      .finally(() => setAdding(false));
  };

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure? Transactions using this category will have no category.')) return;
    api.delete(`/categories/${id}`)
      .then(() => {
        setSuccess('Category deleted.');
        fetchCategories();
        setTimeout(() => setSuccess(''), 3000);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to delete.'));
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2">Loading categories...</p>
      </div>
    );
  }
  const handleUpdate = async (id) => {
  try {
    await api.put(`/categories/${id}`, {
      name: editName,
      type: editType,
      budget: Number(editBudget) || 0
    });

    setSuccess('Category updated');
    setEditingId(null);
    fetchCategories();

    setTimeout(() => setSuccess(''), 3000);
  } catch (err) {
    setError(err.response?.data?.message || 'Update failed');
  }
};

  return (
  <div>
    <h2>Categories</h2>
    <p className="text-muted">Manage your transaction categories.</p>

    {error && <div className="alert alert-danger">{error}</div>}
    {success && <div className="alert alert-success">{success}</div>}

    {/* ===== ADD FORM ===== */}
    <form onSubmit={handleAdd} className="row g-2 mb-4">

      <div className="col-md-3">
        <input
          type="text"
          className="form-control"
          placeholder="Category name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          required
        />
      </div>

      <div className="col-md-2">
        <select
          className="form-select"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>

      <div className="col-md-2">
        <input
          type="number"
          className="form-control"
          placeholder="Budget"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          disabled={type === 'income' || isFixed}
        />
      </div>

      <div className="col-md-2">
        <label>
          <input
            type="checkbox"
            checked={isFixed}
            onChange={(e) => setIsFixed(e.target.checked)}
          /> Fixed
        </label>
      </div>

      <div className="col-md-3">
        <select
          className="form-select"
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
        >
          <option value="">Main Category</option>
          {categories
            .filter(c => !c.parentId)
            .map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
        </select>
      </div>

      <div className="col-auto">
        <button className="btn btn-primary">
          {adding ? 'Adding...' : 'Add'}
        </button>
      </div>

    </form>

    {/* ===== CATEGORY LIST ===== */}
    <ul className="list-group">
      {categories.length === 0 ? (
        <li className="list-group-item text-center text-muted">
          No categories yet
        </li>
      ) : (
        categories
          .filter(parent => !parent.parentId)
          .map(parent => (
            <li key={parent._id} className="list-group-item">

              {/* ===== PARENT ===== */}
              {editingId === parent._id ? (
                <div className="d-flex justify-content-between">

                  <div style={{ width: "60%" }}>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="form-control mb-1"
                    />

                    <select
                      value={editType}
                      onChange={(e) => setEditType(e.target.value)}
                      className="form-select mb-1"
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>

                    <input
                      type="number"
                      value={editBudget}
                      onChange={(e) => setEditBudget(e.target.value)}
                      className="form-control"
                      disabled={editType === 'income' || parent.isFixed}
                    />
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleUpdate(parent._id)}
                    >
                      Save
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </div>

                </div>
              ) : (
                <div className="d-flex justify-content-between align-items-center">

                  <div>
                    <strong>{parent.name}</strong>

                    {parent.isFixed && (
                      <span className="badge bg-info ms-2">Fixed</span>
                    )}

                    <div className="text-muted small">
                      {parent.type} • Budget: ₹{parent.isFixed ? 'N/A' : parent.budget || 0}
                    </div>
                  </div>

                  {!parent.isDefault && !parent.isFixed && (
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => {
                          setEditingId(parent._id);
                          setEditName(parent.name);
                          setEditType(parent.type);
                          setEditBudget(parent.budget || '');
                        }}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(parent._id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}

                </div>
              )}

              {/* ===== SUBCATEGORIES ===== */}
              <ul className="list-group mt-2">
                {categories
                  .filter(sub => sub.parentId === parent._id)
                  .map(sub => (
                    <li
                      key={sub._id}
                      className="list-group-item ms-3 d-flex justify-content-between align-items-center"
                    >
                      {editingId === sub._id ? (
                        <>
                          <div style={{ width: "60%" }}>
                            <input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="form-control mb-1"
                            />

                            <select
                              value={editType}
                              onChange={(e) => setEditType(e.target.value)}
                              className="form-select mb-1"
                            >
                              <option value="expense">Expense</option>
                              <option value="income">Income</option>
                            </select>

                            <input
                              type="number"
                              value={editBudget}
                              onChange={(e) => setEditBudget(e.target.value)}
                              className="form-control"
                              disabled={editType === 'income' || sub.isFixed}
                            />
                          </div>

                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleUpdate(sub._id)}
                            >
                              Save
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => setEditingId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <span>
                            ↳ {sub.name}
                            {sub.isFixed && (
                              <span className="badge bg-info ms-2">Fixed</span>
                            )}
                          </span>

                          {!sub.isDefault && !sub.isFixed && (
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => {
                                  setEditingId(sub._id);
                                  setEditName(sub.name);
                                  setEditType(sub.type);
                                  setEditBudget(sub.budget || '');
                                }}
                              >
                                Edit
                              </button>

                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleDelete(sub._id)}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </li>
                  ))}
              </ul>

            </li>
          ))
      )}
    </ul>
  </div>
);
};

export default CategoryList;
