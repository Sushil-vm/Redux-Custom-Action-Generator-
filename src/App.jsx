import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Grid,
  Input,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  Dialog,
  DialogTitle,
  Tooltip,
  IconButton,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// import CopyButton from "./CopyButton";
// import "./styles.css";

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Tooltip title={copied ? "Copied!" : "Copy"}>
      <IconButton
        size="small"
        onClick={handleCopy}
        sx={{
          position: "absolute",
          top: 6,
          right: 6,
          color: copied ? "green" : "#aaa",
          transition: "0.3s",
          "&:hover": {
            color: "white",
            backgroundColor: "rgba(255,255,255,0.1)",
          },
        }}
      >
        {copied ? (
          <CheckCircleIcon fontSize="small" />
        ) : (
          <ContentCopyIcon fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  );
}

export default function App() {
  const [endpoint, setEndpoint] = useState("");
  const [service, setService] = useState("");
  const [generated, setGenerated] = useState(null);
  const [error, setError] = useState("");
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [formDataMode, setFormDataMode] = useState(false);
  const [customFields, setCustomFields] = useState("");

  const services = [
    "ApiService",
    "AssetService",
    "QcService",
    "ProcurementService",
    "HrService",
    "AdminService",
    "FileUploadServiceAdmin ",
    "FileUploadServiceHr",
    "FileUploadService",
    "fileDownloadService",
    "ErpApiService",
    "StoreService",
    "AccountService",
    "CrmService",
    "CrmUploadService",
    "FinanceService ",
    "DashboardService",
    "ReportService",
    "AccountUploadService",
    "ReraService",
    "SalesService",
    "ApiServiceForDjango",
    "crmServiceForDjango",
    "hrServiceForDjango ",
    "hr1ServiceForDjango ",
    "ComplianceService",
    "QcService",
    "ProcurementService",
    "ReportService",
    "FileUploadService",
  ];

  /* === Formatters === */
  const toConstantFormat = (str) =>
    str
      .replace(/([a-z])([A-Z])/g, "$1_$2")
      .replace(/[\s-]+/g, "_")
      .replace(/_+/g, "_")
      .toUpperCase();

  const toCamelCase = (str) =>
    str
      .toLowerCase()
      .split("_")
      .map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
      .join("");

  useEffect(() => {
    const lastService = localStorage.getItem("selectedService");
    if (lastService) setService(lastService);
  }, []);

  useEffect(() => {
    if (service) localStorage.setItem("selectedService", service);
  }, [service]);

  /* === Step 1: Detect action type === */
  const handleGenerate = () => {
    setError("");
    if (!endpoint.trim()) return setError("Please enter an action name.");
    if (!service) return setError("Please select a service.");

    const lower = endpoint.toLowerCase();
    let prefix = "get";
    if (lower.startsWith("create")) prefix = "create";
    else if (lower.startsWith("update")) prefix = "update";
    else if (lower.startsWith("delete")) prefix = "delete";
    else if (lower.startsWith("get")) prefix = "get";

    if (["create", "update", "delete"].includes(prefix)) {
      setShowFormDialog(true); // ask payload type
    } else if (prefix === "get") {
      setFormDataMode(false);
      setShowFormDialog(true); // ask payload type

      // generateCode("get", false, "");
    }
  };

  const checkFormData = () => {
    const lower = endpoint.toLowerCase();
    let prefix = "get";
    if (lower.startsWith("get")) prefix !== "get";
  };
  /* === Step 2: Ask payload type === */
  const handlePayloadChoice = (isFormData) => {
    setShowFormDialog(false);
    setFormDataMode(isFormData);
    setShowCustomDialog(true); // ask for custom fields next
  };

  /* === Step 3: Generate final code === */
  const generateCode = (prefix, isFormData, fields) => {
    setShowCustomDialog(false);

    const CONSTANT = toConstantFormat(endpoint);
    const camel = toCamelCase(CONSTANT);
    const fieldArray =
      fields
        ?.split(",")
        .map((f) => f.trim())
        .filter((f) => f.length > 0) || [];

    /* === GET ACTION === */

    if (prefix === "get") {
      const typesCode = `export const ${CONSTANT} = "${CONSTANT}";`;

      // 👇 determine fields
      const fieldArray =
        fields
          ?.split(",")
          .map((f) => f.trim())
          .filter((f) => f.length > 0) || [];

      // 👇 fallback if user didn't enter anything
      const usedFields =
        fieldArray.length > 0
          ? fieldArray
          : [
              "leaseType",
              "generalSearch",
              "sortOrder",
              "iDisplayStart",
              "iDisplayLength",
            ];

      // 👇 generate lines
      // const fieldCode = usedFields.map((f) => {
      //   if (f === "iDisplayStart") return `    ${f}: 0,`;
      //   if (f === "iDisplayLength") return `    ${f}: -1,`;
      //   return `    ${f}: "",`;
      // });
      let fieldCode = "";
      // if (!isFormData) {
      // fieldCode = fieldArray
      //   .map((f) => `  initialPayload.append("${f}", data.${f});`)
      //   .join("\n");

      fieldCode = fieldArray.map((f) => `    ${f}: "",`).join("\n");
      // }
      const actionCode = `export const ${camel}_action = (data) => { 
          const initialPayload = {
            userID: LoginuserId,
            
        ${fieldCode}
            ...data
          };
        
  return (dispatch) => {
    dispatch(mainLoadingTrue());
    return ${service}.post(ErpApi.${CONSTANT}, initialPayload)
      .then((response) => {
        const { data } = response;
        dispatch(mainLoadingFalse());
        if (!data.error) {
          dispatch(${camel}Success(data));
        } else {
          dispatch(${camel}Success({}));
        }
      })
      .catch((err) => {
        console.log("err", err);
        dispatch(${camel}Success([]));
        dispatch(mainLoadingFalse());
      });
  };
};
export const ${camel}Success = (data) => {
  return {
    type: ${CONSTANT},
    payload: data
  };
};`;

      const reducerInitial = `${camel}: {
  error: false,
  message: "",
  data: [],
  totalCount: 0
},`;

      const reducerCase = `case ${CONSTANT}:
  return Object.assign({}, state, {
    ${camel}: payload
  });`;

      setGenerated({
        types: typesCode,
        action: actionCode,
        reducerInitial,
        reducerCase,
      });
      return;
    }

    /* === CREATE / UPDATE / DELETE === */
    let fieldCode = "";
    if (isFormData) {
      fieldCode = fieldArray
        .map((f) => `  initialPayload.append("${f}", data.${f});`)
        .join("\n");
    } else {
      fieldCode = fieldArray.map((f) => `    ${f}: "",`).join("\n");
    }

    let actionCode = "";

    if (isFormData) {
      // FormData Action
      actionCode = `export const ${camel}_action = (data) => {
  let initialPayload = new FormData();
  initialPayload.append("userID", LoginuserId);
${fieldCode}

  if (Array.isArray(data.taskDocuments)) {
    for (var i = 0; i < data.taskDocuments.length; i++) {
      initialPayload.append(
        "documentFile" + data.taskDocuments[i].documentType + i,
        data.taskDocuments[i].documentFile
      );
    }
    initialPayload.append("taskDocuments", JSON.stringify(data.taskDocuments));
  }

  const config = { headers: { "content-type": "multipart/form-data" } };
  return (dispatch) => {
    dispatch(mainLoadingTrue());
    return ${service}.post(ErpApi.${CONSTANT}, initialPayload, config)
      .then((response) => {
        const { data } = response;
        dispatch(mainLoadingFalse());
        if (!data.error) {
          dispatch(displayMessage({ text: data.message, type: "success" }));
        } else {
          dispatch(displayMessage({ text: data.message, type: "error" }));
        }
      })
      .catch((err) => {
        dispatch(mainLoadingFalse());
      });
  };
};`;
    } else {
      // Normal JSON Action
      actionCode = `export const ${camel}_action = (data) => {
  const initialPayload = {
    userID: LoginuserId,
${fieldCode}
    ...data
  };
  return (dispatch) => {
    dispatch(mainLoadingTrue());
    return ${service}.post(ErpApi.${CONSTANT}, initialPayload)
      .then((response) => {
        const { data } = response;
        dispatch(mainLoadingFalse());
        if (!data.error) {
          dispatch(displayMessage({ text: data.message, type: "success" }));
        } else {
          dispatch(displayMessage({ text: data.message, type: "success" }));
        }
      })
      .catch((err) => {
        dispatch(mainLoadingFalse());
      });
  };
};`;
    }

    setGenerated({ action: actionCode });
  };

  return (
    <div className="App">
      <Grid item xs={12} p={3}>
        <Typography variant="h5" gutterBottom>
          Redux Action Generator
        </Typography>

        {/* Input Section */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Input
            placeholder="Enter action name (e.g., getLease, updateLease)"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            // sx={{ flex: 1 }}
          />
          <FormControl sx={{ minWidth: 220 }}>
            <InputLabel>Select Service</InputLabel>
            <Select
              value={service}
              label="Select Service"
              onChange={(e) => setService(e.target.value)}
            >
              {services.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" onClick={handleGenerate}>
            Generate
          </Button>
        </Box>

        {error && <Typography color="error">{error}</Typography>}

        {/* Step 1: Choose Payload Type */}
        <Dialog open={showFormDialog} onClose={() => setShowFormDialog(false)}>
          <DialogTitle>Select Payload Type</DialogTitle>
          <DialogContent>
            <Typography>
              Do you want to generate this as a <b>FormData</b> (for uploads) or
              normal JSON payload?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => handlePayloadChoice(false)}>Normal</Button>

            <Button
              onClick={() => handlePayloadChoice(true)}
              variant="contained"
              disabled={endpoint.trim().toLowerCase().startsWith("get")}
            >
              FormData
            </Button>
          </DialogActions>
        </Dialog>

        {/* Step 2: Enter Custom Fields */}
        <Dialog
          open={showCustomDialog}
          onClose={() => setShowCustomDialog(false)}
        >
          <DialogTitle>Enter Custom Payload Fields</DialogTitle>
          <DialogContent>
            <Typography mb={1}>
              Enter comma-separated field names (e.g.,{" "}
              <code>leaseType, contractType, projectID</code>)
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter fields here..."
              value={customFields}
              onChange={(e) => setCustomFields(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                const lower = endpoint.toLowerCase();
                const prefix = lower.startsWith("create")
                  ? "create"
                  : lower.startsWith("update")
                  ? "update"
                  : lower.startsWith("delete")
                  ? "delete"
                  : "get";
                generateCode(prefix, formDataMode, customFields);
              }}
            >
              Generate
            </Button>
          </DialogActions>
        </Dialog>

        {/* Output Section */}
        {generated && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }} />
            {Object.entries(generated).map(([key, code]) => (
              <Box key={key} sx={{ mb: 3, position: "relative" }}>
                <Typography variant="h6" sx={{ mb: 1, color: "#00d26a" }}>
                  {key}.js
                </Typography>
                <CopyButton text={code} />
                <Box
                  sx={{
                    background: "#1e1e1e",
                    color: "#00ff90",
                    p: 2,
                    borderRadius: 2,
                    fontFamily: "monospace",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {code}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Grid>
    </div>
  );
}
