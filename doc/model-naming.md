# 🧠 Model Naming Convention — Neuroom Project

## 1. General Structure

Each model in the Neuroom project should follow the structure below:

```
<scope>-<variant>-v<major>.<minor>
```

---

## 2. Section Meaning

### **scope**

Project name:

* `neuroom`

### **variant**

Type or characteristic of the model:

* `base` → simple model (prototype)
* `batch` → model capable of processing batches
* `nopre` → model trained from scratch without pre-training
* `lt` → lightweight or optimized model
* `xl` → larger or extended model

*(Other variants can be added as needed.)*

### **version**

Model version using **semantic versioning**:

* `v0.x` → internal prototypes
* `v1.x` → first stable version
* `vX.Y` → major or minor updates

---

## 3. Examples

| Use Case                   | Model Name           |
| -------------------------- | -------------------- |
| Simple prototype           | `neuroom-base-v0.1`  |
| Stable simple version      | `neuroom-base-v1.0`  |
| Batch variant              | `neuroom-batch-v1.0` |
| Without pre-training       | `neuroom-nopre-v0.1` |
| Lightweight mobile version | `neuroom-lt-v1.0`    |

---

## 4. Additional Rules

* Never include the name or source of pre-trained models in the model name.
* Add new variants only if necessary.
* Increment the version with every change:

  * **Major** → architecture change
  * **Minor** → training or hyperparameter updates
  * **Patch** → minor fixes
