"use client";

import { useState, useMemo } from "react";
import { useAdvocates } from "../hooks/useAdvocates";
import { useDebounce } from "../hooks/useDebounce";
import { Advocate } from "../types/advocate";
import styles from "./page.module.css";

export default function Home() {
  const {
    advocates,
    pagination,
    loading,
    error,
    refetch,
    goToPage,
    setPageSize,
  } = useAdvocates();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredAdvocates = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return advocates;
    }

    const term = debouncedSearchTerm.toLowerCase();
    return advocates.filter((advocate: Advocate) => {
      return (
        advocate.firstName.toLowerCase().includes(term) ||
        advocate.lastName.toLowerCase().includes(term) ||
        advocate.city.toLowerCase().includes(term) ||
        advocate.degree.toLowerCase().includes(term) ||
        advocate.specialties.some((specialty) =>
          specialty.toLowerCase().includes(term)
        ) ||
        advocate.yearsOfExperience.toString().includes(term)
      );
    });
  }, [advocates, debouncedSearchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleResetSearch = () => {
    setSearchTerm("");
  };

  if (loading) {
    return (
      <main className={styles.container}>
        <h1 className={styles.title}>Solace Advocates</h1>
        <div className={styles.loading}>Loading advocates...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.container}>
        <h1 className={styles.title}>Solace Advocates</h1>
        <div className={styles.error}>
          <p>Error: {error}</p>
          <button onClick={refetch} className={styles.resetButton}>
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Solace Advocates</h1>

      <div className={styles.searchSection}>
        <p className={styles.searchLabel}>Search</p>
        <p>
          Searching for:{" "}
          <span className={styles.searchTerm}>
            {searchTerm || "all advocates"}
          </span>
        </p>
        <input
          type="text"
          className={styles.searchInput}
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search advocates..."
          aria-label="Search advocates"
        />
        <button onClick={handleResetSearch} className={styles.resetButton}>
          Reset Search
        </button>
      </div>

      {pagination && (
        <div className={styles.paginationInfo}>
          <span>
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} advocates
          </span>
          <label>
            Per page:
            <select
              className={styles.pageSizeSelect}
              value={pagination.limit}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>
        </div>
      )}

      {filteredAdvocates.length === 0 ? (
        <div className={styles.emptyState}>
          {searchTerm
            ? "No advocates found matching your search."
            : "No advocates available."}
        </div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>City</th>
              <th>Degree</th>
              <th>Specialties</th>
              <th>Years of Experience</th>
              <th>Phone Number</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdvocates.map((advocate: Advocate) => (
              <tr key={advocate.id}>
                <td>{advocate.firstName}</td>
                <td>{advocate.lastName}</td>
                <td>{advocate.city}</td>
                <td>{advocate.degree}</td>
                <td>
                  {advocate.specialties.map(
                    (specialty: string, index: number) => (
                      <span key={index} className={styles.specialty}>
                        {specialty}
                      </span>
                    )
                  )}
                </td>
                <td>{advocate.yearsOfExperience}</td>
                <td>{advocate.phoneNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {pagination && (
        <div className={styles.pagination}>
          <button
            className={styles.paginationButton}
            onClick={() => goToPage(pagination.page - 1)}
            disabled={!pagination.hasPrev}
          >
            Previous
          </button>

          {[...Array(pagination.totalPages)].map((_, i) => {
            const page = i + 1;
            return (
              <button
                key={page}
                className={`${styles.paginationButton} ${
                  page === pagination.page ? styles.active : ""
                }`}
                onClick={() => goToPage(page)}
              >
                {page}
              </button>
            );
          })}

          <button
            className={styles.paginationButton}
            onClick={() => goToPage(pagination.page + 1)}
            disabled={!pagination.hasNext}
          >
            Next
          </button>
        </div>
      )}
    </main>
  );
}
