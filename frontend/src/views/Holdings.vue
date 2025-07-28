<template>
  <div class="holdings">
    <el-button type="primary" @click="openDialog()" icon="el-icon-plus" style="margin-bottom: 1rem">Add Asset</el-button>

    <el-table :data="assets" stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="type" label="Type" />
      <el-table-column prop="symbol" label="Symbol" />
      <el-table-column prop="name" label="Name" />
      <el-table-column prop="quantity" label="Quantity" />
      <el-table-column prop="purchasePrice" label="Purchase Price" />
      <el-table-column prop="purchaseDate" label="Purchase Date" />
      <el-table-column label="Actions" width="180">
        <template #default="scope">
          <el-button size="small" type="primary" @click="openDialog(scope.row)">Edit</el-button>
          <el-button size="small" type="danger" @click="remove(scope.row.id)">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Dialog -->
    <el-dialog :title="editing.id ? 'Edit Asset' : 'Add Asset'" v-model="dialogVisible" width="500px">
      <el-form :model="editing" label-width="120px">
        <el-form-item label="Type">
          <el-select v-model="editing.type" placeholder="Select type">
            <el-option label="Stock" value="stock" />
            <el-option label="Fund" value="fund" />
            <el-option label="Bond" value="bond" />
            <el-option label="Cash" value="cash" />
          </el-select>
        </el-form-item>
        <el-form-item label="Symbol">
          <el-input v-model="editing.symbol" />
        </el-form-item>
        <el-form-item label="Name">
          <el-input v-model="editing.name" />
        </el-form-item>
        <el-form-item label="Quantity">
          <el-input-number v-model="editing.quantity" :min="0" />
        </el-form-item>
        <el-form-item label="Purchase Price">
          <el-input-number v-model="editing.purchasePrice" :min="0" :step="0.01" />
        </el-form-item>
        <el-form-item label="Purchase Date">
          <el-date-picker v-model="editing.purchaseDate" type="date" placeholder="Pick a date" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="save">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';

const assets = ref([]);
const dialogVisible = ref(false);
const editing = ref({
  id: null,
  type: 'stock',
  symbol: '',
  name: '',
  quantity: 0,
  purchasePrice: 0,
  purchaseDate: null
});

async function loadAssets() {
  const { data } = await api.get('/assets');
  assets.value = data;
}

function openDialog(asset = null) {
  if (asset) {
    editing.value = { ...asset };
  } else {
    editing.value = {
      id: null,
      type: 'stock',
      symbol: '',
      name: '',
      quantity: 0,
      purchasePrice: 0,
      purchaseDate: null
    };
  }
  dialogVisible.value = true;
}

async function save() {
  if (editing.value.id) {
    await api.put(`/assets/${editing.value.id}`, editing.value);
  } else {
    await api.post('/assets', editing.value);
  }
  dialogVisible.value = false;
  await loadAssets();
}

async function remove(id) {
  await api.delete(`/assets/${id}`);
  await loadAssets();
}

onMounted(loadAssets);
</script>

<style scoped>
.holdings {
  padding: 1rem;
}
</style>