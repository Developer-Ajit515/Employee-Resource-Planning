import React, { useState } from "react";
import  "./Role.css";
function RoleList() {

  const permissionList = [
    "User.Create",
    "User.View",
    "User.Edit",
    "User.Delete",

    "Project.Create",
    "Project.View",
    "Project.Edit",
    "Project.Delete",

    "Task.Create",
    "Task.View",
    "Task.Edit",
    "Task.Delete",

    "Employee.Create",
    "Employee.View",
    "Employee.Edit",
    "Employee.Delete"
  ];

  const [roles, setRoles] = useState([
    {
      id: 1,
      roleName: "Admin",
      status: "Active",
      permissions: [
        "User.Create",
        "User.View",
        "Project.Create"
      ]
    },
    {
      id: 2,
      roleName: "Manager",
      status: "Active",
      permissions: [
        "Project.View",
        "Task.Create"
      ]
    },
    {
      id: 3,
      roleName: "Employee",
      status: "Active",
      permissions: [
        "Task.View"
      ]
    }
  ]);

  const [roleName, setRoleName] = useState("");

  const [status, setStatus] = useState("Active");

  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const [search, setSearch] = useState("");

  const [editId, setEditId] = useState(null);
    const handlePermissionChange = (permission) => {

    if (selectedPermissions.includes(permission)) {

      setSelectedPermissions(
        selectedPermissions.filter(
          p => p !== permission
        )
      );

    } else {

      setSelectedPermissions([
        ...selectedPermissions,
        permission
      ]);

    }

  };
    const handleSubmit = () => {

    if (roleName.trim() === "") {
      alert("Role Name is required");
      return;
    }

    if (editId) {

      setRoles(
        roles.map(role =>
          role.id === editId
            ? {
                ...role,
                roleName,
                status,
                permissions: selectedPermissions
              }
            : role
        )
      );

    } else {

      const newRole = {

        id: roles.length + 1,

        roleName,

        status,

        permissions: selectedPermissions

      };

      setRoles([...roles, newRole]);

    }

    setRoleName("");

    setStatus("Active");

    setSelectedPermissions([]);

    setEditId(null);

  };

return (
  <div className="p-6">

    {/* Header */}

    <div className="flex justify-between items-center mb-6">

      <h1 className="text-3xl font-bold">
        Role Management
      </h1>

    </div>

    {/* Role Form */}

    <div className="bg-white shadow-lg rounded-lg p-6 mb-6">

      <h2 className="text-xl font-semibold mb-4">

        {editId ? "Update Role" : "Add New Role"}

      </h2>

      {/* Role Name */}

      <div className="mb-4">

        <label className="block font-medium mb-2">
          Role Name
        </label>

        <input
          type="text"
          value={roleName}
          onChange={(e) =>
            setRoleName(e.target.value)
          }
          placeholder="Enter Role Name"
          className="w-full border rounded-lg p-2"
        />

      </div>

      {/* Status */}

      <div className="mb-4">

        <label className="block font-medium mb-2">
          Status
        </label>

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
          className="w-full border rounded-lg p-2"
        >

          <option value="Active">
            Active
          </option>

          <option value="Inactive">
            Inactive
          </option>

        </select>

      </div>

      {/* Permissions */}

      <div className="mb-5">

        <label className="block font-medium mb-3">
          Permissions
        </label>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

          {permissionList.map((permission) => (

            <label
              key={permission}
              className="flex items-center gap-2 border rounded-lg p-2 cursor-pointer"
            >

              <input
                type="checkbox"
                checked={selectedPermissions.includes(permission)}
                onChange={() =>
                  handlePermissionChange(permission)
                }
              />

              <span>{permission}</span>

            </label>

          ))}

        </div>

      </div>

      {/* Buttons */}

      <div className="flex gap-3">

        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >

          {editId ? "Update Role" : "Save Role"}

        </button>

        <button
          onClick={() => {

            setRoleName("");

            setStatus("Active");

            setSelectedPermissions([]);

            setEditId(null);

          }}
          className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
        >

          Reset

        </button>

      </div>

    </div>
    </div>
);
}

export default RoleList;