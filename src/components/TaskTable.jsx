import { useState } from "react";

const statusOptions = ["Pending", "In Progress", "Completed", "Hold"];

const defaultRow = {
  module: "",
  taskName: "",
  subTask: "",
  status: "Pending",
  time: "",
  device: "",
  comments: "",
};

function TaskTable({ data = [], onSave }) {
  const [rows, setRows] = useState(data.length ? data : [defaultRow]);

  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const addRow = () => {
    setRows([...rows, { ...defaultRow }]);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">📄 Task Sheet</h2>

      <div className="overflow-auto">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Module</th>
              <th className="p-2 border">Task Name</th>
              <th className="p-2 border">Sub Task</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Time</th>
              <th className="p-2 border">Device</th>
              <th className="p-2 border">Comments</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td className="border p-1">
                  <input
                    value={row.module}
                    onChange={(e) => handleChange(i, "module", e.target.value)}
                    className="w-full p-1 outline-none"
                  />
                </td>

                <td className="border p-1">
                  <input
                    value={row.taskName}
                    onChange={(e) =>
                      handleChange(i, "taskName", e.target.value)
                    }
                    className="w-full p-1 outline-none"
                  />
                </td>

                <td className="border p-1">
                  <input
                    value={row.subTask}
                    onChange={(e) => handleChange(i, "subTask", e.target.value)}
                    className="w-full p-1 outline-none"
                  />
                </td>

                <td className="border p-1">
                  <select
                    value={row.status}
                    onChange={(e) => handleChange(i, "status", e.target.value)}
                    className="w-full p-1"
                  >
                    {statusOptions.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </td>

                <td className="border p-1">
                  <input
                    value={row.time}
                    onChange={(e) => handleChange(i, "time", e.target.value)}
                    className="w-full p-1 outline-none"
                  />
                </td>

                <td className="border p-1">
                  <input
                    value={row.device}
                    onChange={(e) => handleChange(i, "device", e.target.value)}
                    className="w-full p-1 outline-none"
                  />
                </td>

                <td className="border p-1">
                  <input
                    value={row.comments}
                    onChange={(e) =>
                      handleChange(i, "comments", e.target.value)
                    }
                    className="w-full p-1 outline-none"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ACTION BUTTONS */}
      <div className="mt-4 flex gap-3">
        <button
          onClick={addRow}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          ➕ Add Row
        </button>

        <button
          onClick={() => onSave && onSave(rows)}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          💾 Save
        </button>
      </div>
    </div>
  );
}

export default TaskTable;
