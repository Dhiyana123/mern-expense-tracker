// Main Expense Tracker Application Component
import { useState, useEffect } from "react";
import { Trash2, CreditCard as Edit2, Plus, ChevronLeft, ChevronRight } from "lucide-react";

// Interface for expense object structure
interface Expense {
  _id: string;
  amount: number;
  category: string;
  description: string;
}

// Backend API URL
const API_URL = "http://localhost:5000/expenses";

function App() {
  // State management using React hooks
  const [expenses, setExpenses] = useState<Expense[]>([]); // List of all expenses
  const [amount, setAmount] = useState(""); // Form input for amount
  const [category, setCategory] = useState(""); // Form input for category
  const [description, setDescription] = useState(""); // Form input for description
  const [editingId, setEditingId] = useState<string | null>(null); // ID of expense being edited
  const [loading, setLoading] = useState(false); // Loading state for API calls
  const [filterCategory, setFilterCategory] = useState(""); // Selected category filter
  const [uniqueCategories, setUniqueCategories] = useState<string[]>([]); // Dynamic categories

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // User can change this
  const [totalItems, setTotalItems] = useState(0);

  // Calculate pagination values
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  // Fetch all expenses when component mounts or when filter/pagination changes
  useEffect(() => {
    fetchExpenses();
  }, [currentPage, itemsPerPage, filterCategory]);

  // Function to fetch expenses from backend
  const fetchExpenses = async () => {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (filterCategory) {
        params.append('category', filterCategory);
      }
      params.append('page', currentPage.toString());
      params.append('limit', itemsPerPage.toString());

      const response = await fetch(`${API_URL}?${params}`);
      const data = await response.json();

      // Handle different response formats
      let expenseData: Expense[] = [];
      let totalCount = 0;

      if (data && Array.isArray(data.expenses)) {
        // If backend returns paginated response
        expenseData = data.expenses;
        totalCount = data.totalCount || data.total || expenseData.length;
      } else if (Array.isArray(data)) {
        // If backend returns simple array (fallback)
        expenseData = data;
        totalCount = data.length;
      }

      setExpenses(expenseData);
      setTotalItems(totalCount);

      // Extract unique categories from all data (you might want a separate endpoint for this)
      const categories = Array.from(new Set(expenseData.map((e) => e.category)));
      setUniqueCategories(categories);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      alert("Failed to fetch expenses");
      setExpenses([]);
      setUniqueCategories([]);
      setTotalItems(0);
    }
  };

  // Function to add a new expense
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !category || !description) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          category,
          description,
        }),
      });

      if (response.ok) {
        setAmount("");
        setCategory("");
        setDescription("");
        // Reset to first page to show the newly added expense
        setCurrentPage(1);
        fetchExpenses();
      } else {
        alert("Failed to add expense");
      }
    } catch (error) {
      console.error("Error adding expense:", error);
      alert("Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  // Function to update an existing expense
  const handleUpdateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          category,
          description,
        }),
      });

      if (response.ok) {
        setAmount("");
        setCategory("");
        setDescription("");
        setEditingId(null);
        fetchExpenses();
      } else {
        alert("Failed to update expense");
      }
    } catch (error) {
      console.error("Error updating expense:", error);
      alert("Failed to update expense");
    } finally {
      setLoading(false);
    }
  };

  // Function to delete an expense
  const handleDeleteExpense = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (response.ok) {
        // If we're on the last page and deleting the last item, go to previous page
        if (expenses.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchExpenses();
        }
      } else {
        alert("Failed to delete expense");
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Failed to delete expense");
    }
  };

  // Populate form for editing
  const handleEditClick = (expense: Expense) => {
    setEditingId(expense._id);
    setAmount(expense.amount.toString());
    setCategory(expense.category);
    setDescription(expense.description);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setAmount("");
    setCategory("");
    setDescription("");
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  // Filtered expenses (client-side filtering as fallback)
  const filteredExpenses = filterCategory
    ? expenses.filter((e) => e.category === filterCategory)
    : expenses;

  // Total sum of filtered expenses
  const totalExpenses = Array.isArray(filteredExpenses)
    ? filteredExpenses.reduce((sum, e) => sum + e.amount, 0)
    : 0;

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 20px" }}>
      {/* Header */}
      <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "10px", textAlign: "center" }}>
        Expense Tracker
      </h1>
      <p style={{ textAlign: "center", color: "#666", marginBottom: "30px" }}>
        Track your daily expenses efficiently
      </p>

      {/* Total Expenses Display */}
      <div style={{ backgroundColor: "#4CAF50", color: "white", padding: "20px", borderRadius: "8px", marginBottom: "30px", textAlign: "center" }}>
        <h2 style={{ fontSize: "18px", marginBottom: "5px" }}>Total Expenses</h2>
        <p style={{ fontSize: "36px", fontWeight: "bold" }}>${totalExpenses.toFixed(2)}</p>
      </div>

      {/* Add/Edit Expense Form */}
      <div style={{ backgroundColor: "white", padding: "25px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", marginBottom: "30px" }}>
        <h3 style={{ fontSize: "20px", marginBottom: "20px", fontWeight: "600" }}>
          {editingId ? "Edit Expense" : "Add New Expense"}
        </h3>
        <form onSubmit={editingId ? handleUpdateExpense : handleAddExpense}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Amount ($)</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "14px" }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Food, Transport, Entertainment"
              style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "14px" }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the expense"
              style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "14px" }}
            />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                backgroundColor: editingId ? "#FF9800" : "#4CAF50",
                color: "white",
                padding: "12px",
                border: "none",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: "600",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {editingId ? <Edit2 size={18} /> : <Plus size={18} />}
              {loading ? "Processing..." : editingId ? "Update Expense" : "Add Expense"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                style={{
                  backgroundColor: "#666",
                  color: "white",
                  padding: "12px 20px",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Filter and Pagination Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "15px" }}>
        {/* Category Filter */}
        {uniqueCategories.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <label style={{ fontWeight: "500" }}>Filter by Category:</label>
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setCurrentPage(1); // Reset to first page when filter changes
              }}
              style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd", fontSize: "14px" }}
            >
              <option value="">All</option>
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Items Per Page Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label style={{ fontWeight: "500" }}>Items per page:</label>
          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd", fontSize: "14px" }}
          >
            <option value="3">3</option>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
          </select>
        </div>
      </div>

      {/* Expenses List */}
      <div style={{ backgroundColor: "white", padding: "25px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ fontSize: "20px", fontWeight: "600" }}>Expense History</h3>
          <div style={{ color: "#666", fontSize: "14px" }}>
            Showing {startIndex + 1}-{endIndex} of {totalItems} expenses
          </div>
        </div>

        {filteredExpenses.length === 0 ? (
          <p style={{ textAlign: "center", color: "#999", padding: "20px" }}>
            No expenses found. {filterCategory ? `Try changing the category filter.` : 'Add your first expense above!'}
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
            {filteredExpenses.map((expense) => (
              <div
                key={expense._id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "15px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "6px",
                  backgroundColor: "#fafafa",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "5px" }}>
                    <span style={{ fontSize: "24px", fontWeight: "bold", color: "#4CAF50" }}>${expense.amount.toFixed(2)}</span>
                    <span style={{ backgroundColor: "#2196F3", color: "white", padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: "600" }}>
                      {expense.category}
                    </span>
                  </div>
                  <p style={{ color: "#666", fontSize: "14px" }}>{expense.description}</p>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => handleEditClick(expense)}
                    style={{
                      backgroundColor: "#FF9800",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "8px 12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <Edit2 size={16} /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteExpense(expense._id)}
                    style={{
                      backgroundColor: "#f44336",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "8px 12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ color: "#666", fontSize: "14px" }}>
              Page {currentPage} of {totalPages}
            </div>
            
            <div style={{ display: "flex", gap: "5px" }}>
              {/* Previous Button */}
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                style={{
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor: currentPage === 1 ? "#f5f5f5" : "white",
                  color: currentPage === 1 ? "#999" : "#333",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <ChevronLeft size={16} /> Previous
              </button>

              {/* Page Numbers */}
              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageClick(page)}
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    backgroundColor: currentPage === page ? "#4CAF50" : "white",
                    color: currentPage === page ? "white" : "#333",
                    cursor: "pointer",
                    fontWeight: currentPage === page ? "600" : "normal",
                  }}
                >
                  {page}
                </button>
              ))}

              {/* Next Button */}
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                style={{
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor: currentPage === totalPages ? "#f5f5f5" : "white",
                  color: currentPage === totalPages ? "#999" : "#333",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;