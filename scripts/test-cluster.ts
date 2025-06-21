// scripts/test-cluster.ts
import 'dotenv/config'; // Make sure environment variables are loaded
import { getEmbeddings } from '@/lib/service/openai';

/**
 * A standalone script to test the article clustering functionality.
 */
async function testClustering() {
    const text1 = `
    SEPANG: The much-awaited Kuala Lumpur International Airport (KLIA) Aerotrain is set to return to service as early as July 1, says Transport Minister Anthony Loke.

“It stopped operations several years ago, but today I am happy to announce that the project is completed with various trials conducted. It will undergo several more tests soon, including the Emergency Response Plan test, together with the authorities.

“If everything goes well, it will begin operations at 10am on July 1,” Loke said at a press conference at KLIA on Saturday (June 21).

Loke mentioned that the Aerotrain project will enhance KLIA’s service and image.

He also said the current shuttle bus system will operate concurrently to facilitate better passenger movement.

ALSO READ: Loke hints KLIA aerotrain to be back in service soon

“These are among the mitigation measures to ensure all passenger movement at KLIA runs smoothly,” he said.

Loke said that there are currently three Aerotrain sets, with two sets to run concurrently while one remains on standby.

During off-peak hours, however, only one train will operate to allow for maintenance work.

Off-peak hours are between 12am and 5am.

Each train has three carriages and can carry a total of 270 passengers at one time.
`;
    const text2 = `
    Perkhidmatan Aerotrain di Lapangan Terbang Antarabangsa Kuala Lumpur (KLIA) Terminal 1 akan kembali beroperasi pada 1 Julai ini. Ini diumumkan hari ini oleh Menteri Pengangkutan, Anthony Loke selepas projek naik taraf Aerotrain memasuki fasa akhir dan melalui beberapa siri ujian keselamatan termasuk Ujian Tindak Balas Kecemasan (ERP).

    Aerotrain dihentikan operasi sejak Mac 2023 kerana pelbagai isu kerosakan memandangkan ia sudah terlalu usang. Ia memulakan operasi pada tahun 1998 dengan ia menyambungkan terminal utama dengan terminal satelit A.

Dalam sejarah operasi selama 25 tahun, berlaku beberapa insiden kerosakan yang menyebabkan operasi dihentikan seketika. Sejak operasi dihentikan untuk pergi ke terminal satelit A, penumpang biasa perlu menaiki bas sementara perkhidmatan kenderaan mewah ditawarkan untuk penumpang kelas perniagaan.

Malaysia Airport Holdings Berhad mengumumkan tahun lalu Aerotrain tersebut akan siap digantikan pada 31 Januari. Projek ini membabitkan MAHB, Malaysia Airports (Sepang) Sdn Bhd, Alstom Transport Systems Sdn Bhd dan usahasama IJM Construction Sdn Bhd dengan Pestech Technology Sdn Bhd.
    `;

    const text3 = `
    （雪邦21日讯）交通部长陆兆福预告，吉隆坡国际机场接驳电车（Aerotrain）预计将于下月1日起恢复运行，惟需经过有关当局的批准。

陆兆福指出，旅客的安全是重中之重，因此需待交通部与陆路公共交通机构批准，接驳电车才能正式恢复运作。

“在确认绝对安全之前，我们不会作出任何批准。”

他透露，待正式恢复运作之后，高峰时段将有2套电车负责载送，并有1套电车负责待命，至于非高峰时段则会有1套电车运行。

“非高峰时段是凌晨12时至清晨5时，其馀则是高峰时段。”

他提到，目前将暂时保留巴士接驳服务，待接驳电车运作稳定之后再另行决定。

“我们希望随著接驳电车的恢复运行，能让旅客在更舒适地往返于主航厦与卫星大楼。”
机场接驳电车恢复运作之后，旅客能更舒适地往返于主航厦与卫星大楼。
机场接驳电车恢复运作之后，旅客能更舒适地往返于主航厦与卫星大楼。

马来西亚机场控股公司（MAHB）今日在吉隆坡国际机场第一航站举行试运行仪式，并邀请陆兆福与一众媒体一同见证。

机场接驳电车过去因多次故障而屡遭诟病，在2023年2月27日，一列接驳电车在主航厦与卫星大楼之间抛锚。

尽管第二列接驳电车随后启动，却再因出现技术问题，导致乘客只能步行至卫星大楼。
陆兆福试乘接驳电车，并竖起大拇指表示满意。
陆兆福试乘接驳电车，并竖起大拇指表示满意。

同年3月1日，另一列接驳电车再次故障，造成114名乘客受困，接驳电车服务随后于2023年3月2日全面暂停。

除了陆兆福以外，交通部秘书长拿督加纳山蒂兰与机场控股公司董事经理拿督莫哈末依扎尼同样出席了今日的试运行仪式。

    `;

    console.log("Getting embeddings for both articles...");
    const [embedding1, embedding2, embedding3] = await Promise.all([
        getEmbeddings(text1),
        getEmbeddings(text2),
        getEmbeddings(text3),
    ]);

    const similarity12 = cosineSimilarity(embedding1, embedding2);
    const similarity13 = cosineSimilarity(embedding1, embedding3);
    const similarity23 = cosineSimilarity(embedding2, embedding3);

    console.log(`The similarity between the two articles is: ${similarity12}, ${similarity13}, ${similarity23}`);
}

function cosineSimilarity(vecA: number[], vecB: number[]) {
    const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
    const normA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
    const normB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));

    if (normA === 0 || normB === 0) {
        return 0;
    }

    return dotProduct / (normA * normB);
}

// Execute the script
testClustering().catch(e => console.error("A top-level error occurred:", e)); 