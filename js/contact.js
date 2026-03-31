let nombre = '';
let correo = '';
let asunto = '';
let mensaje = '';
let whatsapp = '';

/* ── Premium Toast Notification ── */
function showToast(message, type) {
  // Remove existing toast
  const existing = document.getElementById('rs-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'rs-toast';
  toast.className = 'rs-toast rs-toast--' + type;
  toast.innerHTML = '<span class="rs-toast__icon">' +
    (type === 'success' ? '✓' : type === 'error' ? '✗' : '⚠') +
    '</span><span class="rs-toast__msg">' + message + '</span>';

  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(function() {
    toast.classList.add('rs-toast--show');
  });

  // Auto-dismiss after 4s
  setTimeout(function() {
    toast.classList.remove('rs-toast--show');
    setTimeout(function() { toast.remove(); }, 400);
  }, 4000);
}

// Expose globally for use from home.js
window.rsToast = showToast;

/* ── Inline Field Error ── */
function showFieldError(fieldId, message) {
  clearFieldError(fieldId);
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.classList.add('rs-input--error');
  const err = document.createElement('div');
  err.className = 'rs-field-error';
  err.textContent = message;
  field.parentNode.appendChild(err);
}

function clearFieldError(fieldId) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.classList.remove('rs-input--error');
  const existing = field.parentNode.querySelector('.rs-field-error');
  if (existing) existing.remove();
}

function clearAllErrors() {
  document.querySelectorAll('.rs-input--error').forEach(function(el) {
    el.classList.remove('rs-input--error');
  });
  document.querySelectorAll('.rs-field-error').forEach(function(el) {
    el.remove();
  });
}

/* ── Send Email ── */
function sendEmail() {
  clearAllErrors();

  nombre = document.getElementById('nombre').value;
  correo = document.getElementById('correo').value.toLowerCase();
  asunto = document.getElementById('asunto').value;
  mensaje = document.getElementById('mensaje').value;
  whatsapp = document.getElementById('tel').value;

  if (validateCampos() && validateEmail() && validatePhone()) {
    document.getElementById('enviar').innerHTML = '<i class="fa fa-spinner fa-spin"></i> ' + i18n.t('contact.sending');
    document.getElementById('enviar').disabled = true;

    let data = { nombre, correo, asunto, mensaje, whatsapp };

    $.ajax({
      type: "POST",
      url: conf.api + 'sendEmail',
      data: JSON.stringify(data),
      traditional: true,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'x-api-key': conf.apikey
      },
      success: function(data) {
        document.getElementById('enviar').innerHTML = i18n.t('contact.send');
        document.getElementById('enviar').disabled = false;
        document.getElementById('contact-form').reset();
        showToast(i18n.t('toast.success'), 'success');
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        document.getElementById('enviar').innerHTML = i18n.t('contact.send');
        document.getElementById('enviar').disabled = false;
        showToast(i18n.t('toast.error'), 'error');
      }
    });
  }
}

/* ── Validators ── */
function validateEmail() {
  let reg = new RegExp('[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$');
  if (reg.test(correo)) {
    return true;
  } else {
    showFieldError('correo', i18n.t('field.email'));
    showToast(i18n.t('toast.email'), 'warning');
    return false;
  }
}

function validatePhone() {
  let reg = new RegExp('[0-9]{10}$');
  if (reg.test(whatsapp)) {
    return true;
  } else {
    showFieldError('tel', i18n.t('field.phone'));
    showToast(i18n.t('toast.phone'), 'warning');
    return false;
  }
}

function validateCampos() {
  let valid = true;
  if (nombre.length <= 3) {
    showFieldError('nombre', i18n.t('field.name'));
    valid = false;
  }
  if (asunto.length < 3) {
    showFieldError('asunto', i18n.t('field.subject'));
    valid = false;
  }
  if (mensaje.length <= 5) {
    showFieldError('mensaje', i18n.t('field.message'));
    valid = false;
  }
  if (!valid) {
    showToast(i18n.t('toast.fields'), 'warning');
  }
  return valid;
}