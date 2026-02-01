import React from 'react';
import { Form, Spinner } from 'react-bootstrap';
import useOrganization from '../hooks/useOrganization';
import styles from './OrganizationSelector.module.css';

const OrganizationSelector: React.FC = () => {
  const { organizations, activeOrganization, loading, setActiveOrganization } = useOrganization();

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (!id) return;
    try {
      await setActiveOrganization(id);
    } catch  {
      // error handled by provider; keep silent here
    }
  };

  if (loading)
    return (
      <div className={styles.wrapper}>
        <Spinner animation="border" size="sm" />
      </div>
    );

  return (
    <div className={styles.wrapper}>
      <Form.Select
        aria-label="Seleccionar organización"
        value={activeOrganization?.id ?? ''}
        onChange={handleChange}
        className={`${styles.select} me-2`}
      >
        <option value="">Sin organización</option>
        {organizations.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </Form.Select>
    </div>
  );
};

export default OrganizationSelector;
