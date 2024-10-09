<script lang="ts">
    import { indices } from '$lib/dal/data'
    import { IndexType, type Table } from '$lib/types'
    import SectionBase from './SectionBase.svelte'

    export let tableData: Table
    $: tableName = tableData.name

    $: tableIndices = $indices[tableName] ?? []

    function add(): void {
        if (!tableIndices.length) {
            $indices[tableName] = []
        }

        $indices[tableName] = [
            ...$indices[tableName],
            {
                type: IndexType.INDEX,
                colNames: tableData.cols.slice(0, 2).map(v => v.name)
            }
        ]
    }
</script>

<SectionBase title="Indices" disableAdd={tableData.cols.length < 2} on:add={add}>
    <!-- TODO: Highlight indices red if theyre duplicates (or if len() < 2) -->
</SectionBase>
