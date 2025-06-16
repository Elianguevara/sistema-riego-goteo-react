import './StatusToggle.css';

interface StatusToggleProps {
  isActive: boolean;
  isLoading: boolean;
  onChange: () => void;
}

const StatusToggle = ({ isActive, isLoading, onChange }: StatusToggleProps) => {
  const handleChange = () => {
    if (!isLoading) {
      onChange();
    }
  };

  return (
    <label className="switch">
      <input
        type="checkbox"
        checked={isActive}
        onChange={handleChange}
        disabled={isLoading}
      />
      <span className="slider round"></span>
    </label>
  );
};

export default StatusToggle;