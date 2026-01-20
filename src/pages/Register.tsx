import React from 'react';
import RegisterForm from '../components/RegisterForm';
import styles from './Register.module.css';

const Register: React.FC = () => {
  return (
    <div className={styles.container}>
      <RegisterForm />
    </div>
  );
};

export default Register;
