import axios from "./axios";

type CrudServiceOptions = {
  /**
   * The backend is inconsistent about this per-resource (checked against
   * schema.d.ts): most use PATCH, but users/employee-hourly-rates/branches/
   * leave-requests/time-tracking use PUT. Pass "put" for those.
   */
  updateMethod?: "patch" | "put";
};

type QueryParams = Record<string, string | number | boolean | undefined>;

export function createCrudService<
  TEntity,
  TCreateDTO = Partial<TEntity>,
  TUpdateDTO = Partial<TEntity>
>(basePath: string, options: CrudServiceOptions = {}) {
  const updateMethod = options.updateMethod ?? "patch";

  return {
    list: async (params?: QueryParams): Promise<TEntity[]> => {
      const res = await axios.get<TEntity[]>(basePath, { params });
      return res.data;
    },

    getById: async (id: number | string): Promise<TEntity> => {
      const res = await axios.get<TEntity>(`${basePath}/${id}`);
      return res.data;
    },

    create: async (data: TCreateDTO): Promise<TEntity> => {
      const res = await axios.post<TEntity>(basePath, data);
      return res.data;
    },

    update: async (id: number | string, data: TUpdateDTO): Promise<TEntity> => {
      const res = await axios[updateMethod]<TEntity>(`${basePath}/${id}`, data);
      return res.data;
    },

    remove: async (id: number | string): Promise<void> => {
      await axios.delete(`${basePath}/${id}`);
    },
  };
}
