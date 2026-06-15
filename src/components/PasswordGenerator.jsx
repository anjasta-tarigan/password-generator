import { useState, useCallback } from 'react';
import { generatePassword, getPasswordStrength } from '../utils/password';
import './PasswordGenerator.css';

export default function PasswordGenerator() {
  const [password, setPassword] = useState(() => generatePassword(defaultOptions()));
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [options, setOptions] = useState(defaultOptions());
  const [showPassword, setShowPassword] = useState(true);

  const strength = getPasswordStrength(password);

  function handleOption(key, value) {
    setOptions(prev => ({ ...prev, [key]: value }));
  }

  const regenerate = useCallback(() => {
    setPassword(generatePassword(options));
    setPasswordCopied(false);
  }, [options]);

  const copyPassword = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(password);
      setPasswordCopied(true);
      setTimeout(() => setPasswordCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = password;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setPasswordCopied(true);
      setTimeout(() => setPasswordCopied(false), 2000);
    }
  }, [password]);

  return (
    <div className="pg-container">
      <header className="pg-header">
        <h1>Password Generator</h1>
        <p>Create strong, secure passwords instantly</p>
      </header>

      {/* Password Display */}
      <div className="pg-display-card">
        <div className="pg-password-area">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            readOnly
            className="pg-password-input"
          />
          <button
            className="pg-toggle-visibility"
            onClick={() => setShowPassword(p => !p)}
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>

        {/* Strength Meter */}
        <div className="pg-strength-section">
          <div className="pg-strength-bar-track">
            <div
              className="pg-strength-bar-fill"
              style={{
                width: `${strength.score}%`,
                backgroundColor: strength.color,
              }}
            />
          </div>
          <span className="pg-strength-label" style={{ color: strength.color }}>
            {strength.label}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="pg-actions">
          <button className="pg-btn pg-btn-primary" onClick={regenerate}>
            🔄 Generate New
          </button>
          <button
            className={`pg-btn pg-btn-copy ${passwordCopied ? 'pg-btn-copied' : ''}`}
            onClick={copyPassword}
          >
            {passwordCopied ? '✅ Copied!' : '📋 Copy'}
          </button>
        </div>
      </div>

      {/* Options */}
      <div className="pg-options-card">
        <h2 className="pg-options-title">Options</h2>

        {/* Length */}
        <div className="pg-option-group">
          <div className="pg-option-header">
            <label htmlFor="length">Length</label>
            <span className="pg-length-value">{options.length}</span>
          </div>
          <input
            id="length"
            type="range"
            min="4"
            max="128"
            value={options.length}
            onChange={e => handleOption('length', Number(e.target.value))}
            className="pg-slider"
          />
          <div className="pg-slider-ticks">
            <span>4</span>
            <span>128</span>
          </div>
        </div>

        {/* Character Sets */}
        <div className="pg-option-group">
          <label className="pg-checkbox-label">
            <input
              type="checkbox"
              checked={options.uppercase}
              onChange={e => handleOption('uppercase', e.target.checked)}
            />
            <span className="pg-checkbox-custom" />
            <span>Uppercase (A-Z)</span>
          </label>

          <label className="pg-checkbox-label">
            <input
              type="checkbox"
              checked={options.lowercase}
              onChange={e => handleOption('lowercase', e.target.checked)}
            />
            <span className="pg-checkbox-custom" />
            <span>Lowercase (a-z)</span>
          </label>

          <label className="pg-checkbox-label">
            <input
              type="checkbox"
              checked={options.numbers}
              onChange={e => handleOption('numbers', e.target.checked)}
            />
            <span className="pg-checkbox-custom" />
            <span>Numbers (0-9)</span>
          </label>

          <label className="pg-checkbox-label">
            <input
              type="checkbox"
              checked={options.symbols}
              onChange={e => handleOption('symbols', e.target.checked)}
            />
            <span className="pg-checkbox-custom" />
            <span>Symbols (!@#$%^&*)</span>
          </label>
        </div>

        {/* Exclude Similar */}
        <div className="pg-option-group">
          <label className="pg-checkbox-label">
            <input
              type="checkbox"
              checked={options.excludeSimilar}
              onChange={e => handleOption('excludeSimilar', e.target.checked)}
            />
            <span className="pg-checkbox-custom" />
            <span className="pg-checkbox-text">
              Exclude similar characters <span className="pg-muted">(I, l, 1, O, 0)</span>
            </span>
          </label>
        </div>
      </div>

      <footer className="pg-footer">
        <p>Password length: {password.length} characters · {options.uppercase && 'A-Z '}{options.lowercase && 'a-z '}{options.numbers && '0-9 '}{options.symbols && '!@#$%^&* '}</p>
        <p className="pg-brand">SLT Developer</p>
      </footer>
    </div>
  );
}

function defaultOptions() {
  return {
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeSimilar: false,
  };
}
