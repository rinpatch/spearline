// scripts/verify-cluster-finding.ts
import 'dotenv/config';
import { findClusterForText } from '@/lib/model/story';

/**
 * A standalone script to verify that `findClusterForText` can correctly identify
 * an existing cluster for a given piece of text.
 */
async function verifyClusterFinding() {
    console.log("Testing findClusterForText...");

    // This text is identical to one used in other tests. If an article with this
    // content has been processed and assigned to a story, this script should find it.
    const textToTest = `
KUALA LUMPUR: The Political Bureau and Central Leadership Council (MPP) of Parti Keadilan Rakyat (PKR) has reappointed Datuk Dr Fuziah Salleh as the party's secretary-general following a meeting held earlier today. The meeting also decided on the reappointments of William Leong as treasurer-general and MPP member Datuk Fahmi Fadzil as information chief. In a statement issued after the meeting, Fahmi said Nurul Izzah Anwar and Datuk Seri Saifuddin Nasution Ismail had been appointed as joint election directors. Saifuddin Nasution was also named as a member of the Political Bureau. He added that Datuk Mustapha Sakmud would remain as chairman of the Sabah State Leadership Council (MPN). "The meeting expressed its utmost appreciation for the sacrifices, contributions, and dedicated service of the former deputy president and other leaders, and hopes that they would continue contributing to the party and its cause," he said. Fahmi said the meeting also discussed current issues, including global geopolitical and economic matters, as well as the party's machinery readiness ahead of the Sabah election.
`;

    const storyId = await findClusterForText(textToTest);

    if (storyId) {
        console.log(`✅ Success! Found cluster with story_id: ${storyId}`);
    } else {
        console.log(`❌ Failure! Did not find any cluster for the given text.`);
        console.log("This might be expected if no similar, clustered article exists in the database.");
    }
}

verifyClusterFinding().catch(e => console.error("An error occurred during verification:", e)); 