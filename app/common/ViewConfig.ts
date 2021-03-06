import IndexLogic from "../logic/view_logic/IndexLogic";
import AlertLogic from "../logic/view_logic/AlertLogic";
import GameLogic from "../logic/view_logic/GameLogic";
import FindLogic from "../logic/view_logic/FindLogic";
import NewsContent from "../logic/view_logic/NewsContent";
import CollectLogic from "../logic/view_logic/CollectLogic";
import RechargeLogic from "../logic/view_logic/RechargeLogic";
import RechargeSuccess from "../logic/view_logic/RechargeSuccess";
import RechargeRecordLogic from "../logic/view_logic/RechargeRecordLogic";
import IntegralLogic from "../logic/view_logic/IntegralLogic";
import OrderDetail from "../logic/view_logic/OrderDetail";
import IntegralDetail from "../logic/view_logic/IntegralDetail";
import AwardsBox from "../logic/view_logic/AwardsBox";
import PersonalLogic from "../logic/view_logic/PersonalLogic";
import GameInner from '../logic/view_logic/GameInner'
import EmailLogic from "../logic/view_logic/EmailLogic";
import NewsInfo from "../logic/view_logic/newsInfo";
import MyOrder from "../logic/view_logic/MyOrder";
import AddressesLogic from "../logic/view_logic/AddressesLogic";
import AddressLogic from "../logic/view_logic/AddressLogic";
import Logistics from "../logic/view_logic/Logistics";
import Customer from "../logic/view_logic/Customer";
import MyShare from "../logic/view_logic/MyShare";
import MySign from "../logic/view_logic/MySign";
import UpdateAddress from "../logic/view_logic/UpdateAddress";
import OrderSubmit from "../logic/view_logic/OrderSubmit";
import FriendRecharge from "../logic/view_logic/FriendRecharge";
import ShareFriendRecharge from "../logic/view_logic/ShareFriendRecharge";
import Guide from "../logic/view_logic/Guide";
import GameEludeLogic from "../logic/view_logic/GameEludeLogic";
import GameNumberLogic from "../logic/view_logic/GameNumberLogic";
import Recommend from "../logic/view_logic/Recommend";
import RecommendTips from "../logic/view_logic/RecommendTips";
import RewardPage from "../logic/view_logic/RewardPage";


/**
 * ??????????????????????????????????????????
 */
export default class ViewConfig {
    /**?????? */
    static index: viewConfig = { name: 'index', class: IndexLogic, skin: 'view/main.html', closePre: true };
    /**?????? */
    static find: viewConfig = { name: 'find', class: FindLogic, skin: 'view/find.html', closePre: true };
    /**???????????? */
    static newsContent: viewConfig = { name: 'newsContent', class: NewsContent, skin: 'view/news-content.html', closePre: true };
    /**???????????? */
    static collect: viewConfig = { name: 'collect', class: CollectLogic, skin: 'view/collect.html', closePre: true };
    /**?????? */
    static recharge: viewConfig = { name: 'recharge', class: RechargeLogic, skin: 'view/recharge.html', closePre: false };
    /**???????????? */
    static rechargeSuccess: viewConfig = { name: 'rechargeSuccess', class: RechargeSuccess, skin: 'view/rechargeSuccess.html', closePre: true };
    /**???????????? */
    static rechargeRecord: viewConfig = { name: 'rechargeRecord', class: RechargeRecordLogic, skin: 'view/rechargeRecord.html', closePre: false };
    /**???????????? */
    static friendRecharge: viewConfig = { name: 'friendRecharge', class: FriendRecharge, skin: 'view/friendRecharge.html', closePre: false };
   /**?????????????????? */
   static shareFriendRecharge: viewConfig = { name: 'shareFriendRecharge', class: ShareFriendRecharge, skin: 'view/shareFriendRecharge.html', closePre: true };
    /**????????? */
    static integral: viewConfig = { name: 'integral', class: IntegralLogic, skin: 'view/integral.html', closePre: true };
    /**????????????*/
    static myOrder: viewConfig = { name: 'myOrder', class: MyOrder, skin: 'view/myOrder.html', closePre: true };
    /**???????????? */
    static orderDetail: viewConfig = { name: 'orderDetail', class: OrderDetail, skin: 'view/orderDetail.html', closePre: true };
    /**???????????? */
    static orderSubmit: viewConfig = { name: 'orderSubmit', class: OrderSubmit, skin: 'view/orderSubmit.html', closePre: true };
    /**??????????????? */
    static integralDetail: viewConfig = { name: 'integralDetail', class: IntegralDetail, skin: 'view/integralDetail.html', closePre: true };
    /**????????? */
    static awardsBox: viewConfig = { name: 'awardsBox', class: AwardsBox, skin: 'view/awardsBox.html', closePre: true };
    /**?????? */
    static personal: viewConfig = { name: 'personal', class: PersonalLogic, skin: 'view/personal.html', closePre: true };
    /**??????????????? */
    static gameInner: viewConfig = { name: 'gameInner', class: GameInner, skin: 'view/gameInner.html', closePre: true };
    /**?????? */
    static email: viewConfig = { name: 'email', class: EmailLogic, skin: 'view/email.html', closePre: true };
    /**????????????*/
    static newsInfo: viewConfig = { name: 'newsInfo', class: NewsInfo, skin: 'view/newsInfo.html', closePre: true };
    /**???????????? */
    static addresses: viewConfig = { name: 'addresses', class: AddressesLogic, skin: 'view/addresses.html', closePre: true };
    /**???????????? */
    static updateAddress: viewConfig = { name: 'updateAddress', class: UpdateAddress, skin: 'view/updateAddress.html', closePre: true  };
    /**?????????????????? */
    static address: viewConfig = { name: 'address', class: AddressLogic, skin: 'view/address.html', closePre: true };
    /**????????????*/
    static logistics: viewConfig = { name: 'logistics', class: Logistics, skin: 'view/logistics.html', closePre: true };
    /**?????? */
    static customer: viewConfig = { name: 'customer', class: Customer, skin: 'view/customer.html', closePre: true };
    /**???????????? */
    static myShare: viewConfig = { name: 'myShare', class: MyShare, skin: 'view/myShare.html', closePre: true  };
    /**???????????? */
    static mySign: viewConfig = { name: 'mySign', class: MySign, skin: 'view/mySign.html', closePre: true  };
    /**????????? */
    static guide: viewConfig = { name: 'guide', class: Guide, skin: 'view/guide.html', closePre: true  };
    /**???????????? */
    static recommend: viewConfig = { name: 'recommend', class: Recommend, skin: 'view/recommend.html', closePre: false  };
    /** ????????????*/
    static recommendTips: viewConfig = { name: 'recommendTips', class: RecommendTips, skin: 'view/recommendTips.html', closePre: false  };
    /**???????????? */
    static rewardPage: viewConfig = { name: 'rewardPage', class: RewardPage, skin: 'view/rewardPage.html', closePre: true  };

    /**?????? */
    static game: viewConfig = { name: 'game', class: GameLogic, skin: 'view/game.html', closePre: false };
    /** ???????????? */
    static gameElude: viewConfig = { name: 'gameElude', class: GameEludeLogic, skin: 'view/gameElude.html', closePre: false };
    /** ???????????? */
    static gameNumber: viewConfig = { name: 'gameNumber', class: GameNumberLogic, skin: 'view/gameNumber.html', closePre: false };
}