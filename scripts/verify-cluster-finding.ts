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
    （八打灵再也22日讯）继柔佛州总警长拿督古玛后，第13任全国总警长丹斯里艾克里沙尼亦遭有心人士以人工智能（AI）技术造假视频，声称接受一名拿督籍人士的金援，而警方接获投报后正对该假视频展开调查。 雪州总警长拿督胡申发表文告指出，社交媒体TikTok是在近期广传一则视频，画面显示一名外貌与艾克里沙尼相似的男子，声称自己接受一名被称为“拿督阿都甘尼”人士的金钱援助，更指该笔款项已被汇入个人银行户头。ADVERTISEMENTif(screen.width < 768){googletag.cmd.push(function() { googletag.display('HPR1_M'); });} “有心人士利用AI技术造假视频，而梳邦再也警方经调查后，也证实第13任全国总警长不曾发表相关言论。” 他表示，艾克里沙尼已就此向警方投报，且否认该视频内容出自其本身。 var isIOS = (typeof AppInterface === 'undefined' && typeof window.webkit !== 'undefined'); var isAndroid = (typeof AppInterface !== 'undefined'); var isFlutterApp = (typeof AppInterfaceV2 !== 'undefined'); if( isIOS || isAndroid || isFlutterApp) { (function(d,a,b,l,e,_) { if(d[b]&&d[b].q)return;d[b]=function(){(d[b].q=d[b].q||[]).push(arguments)};e=a.createElement(l); e.async=1;e.charset='utf-8';e.src='//static.dable.io/dist/plugin.min.js'; _=a.getElementsByTagName(l)[0];_.parentNode.insertBefore(e,_); })(window,document,'dable','script'); dable('setService', 'sinchew.com.my'); dable('sendLogOnce'); dable('renderWidget', 'dablewidget_V7a1WLz7'); } “警方目前援引刑事法典第419（欺骗及假冒）条文，及1998年通讯及多媒体法令233条文调查案件。” 对此，胡申强调雪州警方严肃看待滥用AI等技术进行欺诈或毁谤的行为，因该举动将损坏任何一方的声誉，而涉及者都该受到严厉惩处。 柔佛州总警长拿督古玛在本月中曾澄清，指一段于TikTok上疯传的视频内容完全不实，严正否认视频中接受所谓“拿督阿都马力”的金援，更指视频是由AI技术伪造。
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