import { useEffect, useState } from "react";
import { useFirestore } from "../../contexts/FirestoreContext";
import { toast } from "react-hot-toast";
import { Pencil, Save, Loader2, Store, Clock, Bell } from "lucide-react";

export default function Settings() {
    const { getStoreSettings, updateStoreSettings } = useFirestore();

    const [settings, setSettings] = useState({});
    const [editedSettings, setEditedSettings] = useState({});
    const [docId, setDocId] = useState(null);
    const [editingField, setEditingField] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function fetchSettings() {
            setLoading(true);
            try {
                const data = await getStoreSettings();
                if (data) {
                    setDocId(data.id);
                    const { id, ...fields } = data;
                    setSettings(fields);
                    setEditedSettings(fields);
                } else {
                    toast.error("Store settings not found.");
                }
            } catch (err) {
                console.error(err);
                toast.error("Failed to load settings");
            } finally {
                setLoading(false);
            }
        }
        fetchSettings();
    }, []);

    const handleEdit = (key) => {
        setEditingField(key);
    };

    const handleChange = (key, value) => {
        setEditedSettings((prev) => ({
            ...prev,
            [key]: typeof settings[key] === "number" ? parseFloat(value) || 0 : value,
        }));
    };

    const handleNestedChange = (parentKey, childKey, value) => {
        setEditedSettings((prev) => ({
            ...prev,
            [parentKey]: {
                ...prev[parentKey],
                [childKey]: typeof settings[parentKey]?.[childKey] === "number" ? parseFloat(value) || 0 : value === "true" ? true : value === "false" ? false : value,
            },
        }));
    };

    const handleSave = async (key) => {
        setSaving(true);
        try {
            await updateStoreSettings(docId, { [key]: editedSettings[key] });
            setSettings((prev) => ({ ...prev, [key]: editedSettings[key] }));
            toast.success("Setting updated successfully");
        } catch (err) {
            console.error(err);
            toast.error("Failed to update setting");
        } finally {
            setEditingField(null);
            setSaving(false);
        }
    };

    const formatLabel = (key) => {
        return key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());
    };

    const formatTimeDisplay = (time) => {
        if (!time) return "";
        const [hours, minutes] = time.split(":");
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const settingsConfig = [
        {
            category: "Store Information",
            icon: Store,
            fields: [
                { key: "storeName", label: "Store Name", type: "text" },
                { key: "contactEmail", label: "Contact Email", type: "email" },
            ]
        },
        {
            category: "Business Settings",
            icon: Clock,
            fields: [
                { key: "businessHours.open", label: "Opening Time", type: "time", nested: true, parent: "businessHours" },
                { key: "businessHours.close", label: "Closing Time", type: "time", nested: true, parent: "businessHours" },
                { key: "defaultTax", label: "Default Tax Rate", type: "number", step: "0.01", min: "0", max: "1", suffix: "%" },
            ]
        },
        {
            category: "Notification Preferences",
            icon: Bell,
            fields: [
                { key: "notificationSettings.orderAlerts", label: "Order Alerts", type: "boolean", nested: true, parent: "notificationSettings" },
                { key: "notificationSettings.stockAlerts", label: "Stock Alerts", type: "boolean", nested: true, parent: "notificationSettings" },
            ]
        }
    ];

    const renderField = (field) => {
        const fieldKey = field.key;
        const editKey = field.nested ? `${field.parent}.${field.key.split('.')[1]}` : field.key;
        
        let currentValue, editedValue;
        
        if (field.nested) {
            const childKey = field.key.split('.')[1];
            currentValue = settings[field.parent]?.[childKey];
            editedValue = editedSettings[field.parent]?.[childKey];
        } else {
            currentValue = settings[field.key];
            editedValue = editedSettings[field.key];
        }

        const isEditing = editingField === editKey;

        return (
            <div
                key={fieldKey}
                className="flex items-center justify-between border border-[var(--color-border)] bg-[var(--color-bg)] p-4 rounded-lg hover:shadow-sm transition-shadow"
            >
                <div className="flex-1">
                    <p className="text-sm text-[var(--color-muted)] font-medium">{field.label}</p>
                    {isEditing ? (
                        <div className="mt-2">
                            {field.type === "boolean" ? (
                                <select
                                    value={editedValue?.toString() || "false"}
                                    onChange={(e) => 
                                        field.nested 
                                        ? handleNestedChange(field.parent, field.key.split('.')[1], e.target.value)
                                        : handleChange(field.key, e.target.value)
                                    }
                                    className="input border rounded-md px-3 py-2 w-32 bg-[var(--color-bg)] text-[var(--color-text)] cursor-pointer"
                                >
                                    <option value="true">Enabled</option>
                                    <option value="false">Disabled</option>
                                </select>
                            ) : (
                                <input
                                    type={field.type}
                                    value={editedValue || ""}
                                    onChange={(e) => 
                                        field.nested 
                                        ? handleNestedChange(field.parent, field.key.split('.')[1], e.target.value)
                                        : handleChange(field.key, e.target.value)
                                    }
                                    className="input border rounded-md px-3 py-2 max-w-xs bg-[var(--color-bg)] text-[var(--color-text)]"
                                    step={field.step}
                                    min={field.min}
                                    max={field.max}
                                />
                            )}
                        </div>
                    ) : (
                        <div className="mt-1">
                            {field.type === "boolean" ? (
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                currentValue 
                                    ? "bg-green-100 text-green-800" 
                                    : "bg-red-100 text-red-800"
                                }`}>
                                    {currentValue ? "Enabled" : "Disabled"}
                                </span>
                            ) : field.type === "time" ? (
                                <p className="text-[var(--color-text)] text-base font-medium">
                                    {formatTimeDisplay(currentValue)}
                                </p>
                            ) : field.type === "number" && field.suffix === "%" ? (
                                <p className="text-[var(--color-text)] text-base font-medium">
                                    {((currentValue || 0) * 100).toFixed(1)}%
                                </p>
                            ) : (
                                <p className="text-[var(--color-text)] text-base font-medium">
                                    {String(currentValue || "")}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <div className="ml-4">
                    {isEditing ? (
                        <button
                        onClick={() => handleSave(field.nested ? field.parent : field.key)}
                        disabled={saving}
                        className="btn-primary flex items-center gap-2 px-4 py-2 rounded-md disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save
                        </button>
                    ) : (
                        <button
                        onClick={() => handleEdit(editKey)}
                        className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-md hover:bg-[var(--color-border)] transition-colors cursor-pointer"
                        >
                            <Pencil className="w-4 h-4" />
                            Edit
                        </button>
                    )}
                </div>

            </div>
        );
    };

    if (loading) {
        return (
            <div className="bg-[var(--card-bg)] p-6 rounded-xl shadow border border-[var(--color-border)]">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--color-muted)]" />
                    <span className="ml-3 text-[var(--color-muted)]">Loading settings...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-[var(--card-bg)] p-6 rounded-xl shadow border border-[var(--color-border)]">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Store className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--color-text)]">Store Settings</h1>
                        <p className="text-sm text-[var(--color-muted)]">Manage your store configuration and preferences</p>
                    </div>
                </div>

                {settingsConfig.map((section) => {
                    const Icon = section.icon;
                    return (
                        <div key={section.category} className="mb-8 last:mb-0">
                            <div className="flex items-center gap-3 mb-4">
                                <Icon className="w-5 h-5 text-[var(--color-muted)]" />
                                <h2 className="text-lg font-semibold text-[var(--color-text)]">{section.category}</h2>
                            </div>
                            <div className="space-y-3">
                                {section.fields.map(renderField)}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}