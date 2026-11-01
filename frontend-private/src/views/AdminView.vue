<script setup>
import { computed } from 'vue'
import { useUsers } from '../composables/useUsers'

const {
  state,
  totals,
  filteredUsers,
  dashboardRecentUsers,
  chartData,
  initials,
  openCreateModal,
  openEditModal,
  closeModal,
  saveUser,
  openDeleteModal,
  closeDeleteModal,
  confirmDelete,
} = useUsers()

const maxChart = computed(() => Math.max(...chartData.value))
</script>

<template>
  <section class="page page-active">
    <div class="page-header">
      <div class="page-title">Buenos días, Carlos 👋</div>
      <div class="page-subtitle">Resumen de actividad y gestión de usuarios.</div>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">USUARIOS TOTALES</div>
        <div class="kpi-num">{{ totals.total }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">ACTIVOS</div>
        <div class="kpi-num">{{ totals.active }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">ADMINS</div>
        <div class="kpi-num">{{ totals.admin }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">USERS</div>
        <div class="kpi-num">{{ totals.user }}</div>
      </div>
    </div>

    <div class="content-row">
      <div class="card">
        <div class="card-header">
          <div class="card-title">Usuarios recientes</div>
        </div>
        <table class="data-table">
          <thead>
            <tr><th>Usuario</th><th>Rol</th><th>Estado</th><th>Alta</th></tr>
          </thead>
          <tbody>
            <tr v-for="(u, i) in dashboardRecentUsers" :key="u.id">
              <td>
                <div class="user-row-info">
                  <div class="avatar-sm" :class="`avatar-color-${i % 6}`">{{ initials(u.name) }}</div>
                  <span>{{ u.name }}</span>
                </div>
              </td>
              <td><span class="badge" :class="u.role === 'admin' ? 'badge-admin' : 'badge-user'">{{ u.role }}</span></td>
              <td>{{ u.active ? 'Activo' : 'Inactivo' }}</td>
              <td>{{ u.date }}</td>
            </tr>
          </tbody>
        </table>
        <div class="mini-chart">
          <div
            v-for="(value, i) in chartData"
            :key="i"
            class="bar"
            :style="{ height: `${(value / maxChart) * 100}%` }"
          ></div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">Actividad reciente</div></div>
        <div class="activity-list">
          <div class="activity-item">Nuevo registro: Marta López</div>
          <div class="activity-item">Recuperación de contraseña: javier@...</div>
          <div class="activity-item">Usuario editado: Roberto P.</div>
        </div>
      </div>
    </div>

    <div class="page-header" style="margin-top:16px;">
      <div class="page-title">Gestión de usuarios</div>
    </div>
    <div class="toolbar">
      <div class="search-box">
        <input v-model="state.query" type="text" placeholder="Buscar por nombre o email..." />
      </div>
      <select v-model="state.roleFilter" class="btn btn-ghost-sm">
        <option value="">Todos los roles</option>
        <option value="admin">Admin</option>
        <option value="user">Usuario</option>
      </select>
      <button class="btn btn-primary-sm" @click="openCreateModal">+ Nuevo usuario</button>
    </div>

    <div class="card">
      <table class="data-table">
        <thead>
          <tr><th>Usuario</th><th>Email</th><th>Rol</th><th>Auth</th><th>Alta</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          <tr v-for="(u, i) in filteredUsers" :key="u.id">
            <td>
              <div class="user-row-info">
                <div class="avatar-sm" :class="`avatar-color-${i % 6}`">{{ initials(u.name) }}</div>
                <span>{{ u.name }}</span>
              </div>
            </td>
            <td>{{ u.email }}</td>
            <td>{{ u.role }}</td>
            <td>{{ u.auth }}</td>
            <td>{{ u.date }}</td>
            <td>
              <button class="icon-btn" @click="openEditModal(u)">Editar</button>
              <button class="icon-btn danger" @click="openDeleteModal(u)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="modal-overlay" :class="{ show: state.modalOpen }" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">{{ state.modalMode === 'edit' ? 'Editar usuario' : 'Nuevo usuario' }}</div>
          <button class="modal-close" @click="closeModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="field"><label>Nombre</label><input v-model="state.form.name" type="text" /></div>
          <div class="field"><label>Apellidos</label><input v-model="state.form.surname" type="text" /></div>
          <div class="field"><label>Email</label><input v-model="state.form.email" type="email" /></div>
          <div class="field"><label>Rol</label>
            <select v-model="state.form.role"><option value="user">Usuario</option><option value="admin">Admin</option></select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost-sm" @click="closeModal">Cancelar</button>
          <button class="btn btn-primary-sm" @click="saveUser">Guardar usuario</button>
        </div>
      </div>
    </div>

    <div class="modal-overlay" :class="{ show: state.deleteOpen }" @click.self="closeDeleteModal">
      <div class="modal delete-modal">
        <div class="modal-header">
          <div class="modal-title">Eliminar usuario</div>
          <button class="modal-close" @click="closeDeleteModal">✕</button>
        </div>
        <div class="modal-body">
          ¿Eliminar a <strong>{{ state.deleteTarget?.name }}</strong>?
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost-sm" @click="closeDeleteModal">Cancelar</button>
          <button class="btn btn-danger-sm" @click="confirmDelete">Eliminar</button>
        </div>
      </div>
    </div>
  </section>
</template>
