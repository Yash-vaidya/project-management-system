import { useState } from "react";

const statusOptions = ["Pending", "In Progress", "Completed", "Hold"];

const defaultRow = {
  module: "",
  page: "",
  owner: "",
  task: "",
  taskType: "",
  area: "",
  status: "Pending",
  testing: "",
};

function MomTable({ data = [], onSave }) {
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
      <h2 className="text-xl font-semibold mb-4">📄 MOM</h2>

      <div className="overflow-auto">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Module</th>
              <th className="p-2 border">Page</th>
              <th className="p-2 border">Owner</th>
              <th className="p-2 border">Task</th>
              <th className="p-2 border">Task Type</th>
              <th className="p-2 border">Area</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Testing</th>
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
                    value={row.page}
                    onChange={(e) => handleChange(i, "page", e.target.value)}
                    className="w-full p-1 outline-none"
                  />
                </td>

                <td className="border p-1">
                  <input
                    value={row.owner}
                    onChange={(e) => handleChange(i, "owner", e.target.value)}
                    className="w-full p-1 outline-none"
                  />
                </td>

                <td className="border p-1">
                  <input
                    value={row.task}
                    onChange={(e) => handleChange(i, "task", e.target.value)}
                    className="w-full p-1 outline-none"
                  />
                </td>

                <td className="border p-1">
                  <input
                    value={row.taskType}
                    onChange={(e) =>
                      handleChange(i, "taskType", e.target.value)
                    }
                    className="w-full p-1 outline-none"
                  />
                </td>

                <td className="border p-1">
                  <input
                    value={row.area}
                    onChange={(e) => handleChange(i, "area", e.target.value)}
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
                    value={row.testing}
                    onChange={(e) => handleChange(i, "testing", e.target.value)}
                    className="w-full p-1 outline-none"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

export default MomTable;
