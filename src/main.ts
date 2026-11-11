import bank from './generated/bank.json';
import type { Bank } from './domain/types';
import { mountApp } from './ui/app';
import './styles.css';

const mode = import.meta.env.MODE === 'review' ? 'review' : 'learner';
mountApp(document.getElementById('app')!, bank as Bank, mode);
