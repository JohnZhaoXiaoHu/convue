import { defineComponent } from 'vue';
import { useRoute } from 'vue-router';

export default defineComponent({
  setup() {
    const route = useRoute();

    return () => (
      <div>
        {route.params.id}
      </div>
    );
  },
});
