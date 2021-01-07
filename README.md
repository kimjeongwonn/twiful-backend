# 기능

- [ ] config모듈 리팩토링하기 (.env지양)

## 인증

### TODO

- [x] 트위터 로그인
- [x] jwt 토큰 발급
- [ ] jwt 토큰 보안기능 (device authorization)
- [x] guard 기능 구현
- [ ] 트위터 토큰이 만료되었을 경우 (API 연결해제)

### TEST

- [ ] 처음 로그인/가입 (User 없음, Profile 없음) => User 생성후, Profile 생성 => jwt 생성 후 반환
- [ ] 다른 사람으로 TwitterID가 DB에 저장된 상태에서 로그인 (User 있음, Profile 없음) => 매칭된 User에 Profile 생성 => jwt 생성 후 반환
- [ ] 생선된 계정으로 가입 (User 있음, Profile 있음) => 해당하는 User 정보 불러옴 => jwt 생성 후 반환
- [ ] JWT에 해당하는 계정이 삭제되었을 때 => 인증에러 발생 후 JWT삭제
- [ ] JWT에 해당하는 트위터 계정이 유실되었을 때 => 인증에러 발생 후 JWT삭제
- [ ] 토큰이 발행된 기기정보와 접속한 기기정보가 다를 때 => 기존 토큰 파기 후 블랙리스트 => 다시 트위터 OAuth연결

## 사용자

### TODO

- [x] 최초 가입
- [x] 로그인
- [x] 로그인 리다이렉션
      가입할 경우 가입페이지(추가정보 입력)로, 로그인할 경우 redirect 쿼리로 받은 곳으로
- [x] 트위터 주소 공개 로직
      공개, 트친소 할 때만 공개 선택
      친구는 트친소 할 때만 공개해도 접근가능
- [x] 트위터 주소 확인시 트친소 진행중인지 확인하기 (리팩토링 필요: 트친소 모듈내에서 진행할 수 있도록 분리)
- [x] 트위터 주소 공개 토글 뮤테이션
- [x] 비회원 상태에서 제한된 회원정보 보기

### TEST

- [ ] 트위터 주소 공개토글 => true라면 false => false라면 true
- [ ] 트위터 주소 공개한 상태에서 주소요청 => true
- [ ] 트위터 주소 공개하지 않은 상태 AND 친구 아닌 상태 주소요청 => false
- [ ] 트위터 주소 공개하지 않은 상태 AND 친구인 상태 주소요청 => true
- [ ] 트위터 주소 공개하지 않은 상태 AND 트친소 진행중 상태 주소요청 => true

## 친구기능

### TODO

- [x] 친구요청
- [x] 친구요청 메세지 넣기
- [x] 친구 요청시 트친소 진행중인지 확인하기
- [x] 친구수락
- [x] 친구 목록 보기
- [x] 친구목록 pagination
- [x] 겹치는 친구 목록 보기(친구 공개상태에 따라)
- [x] 친구 목록 보기 권한 설정
      공개 or 친구공개
- [x] 친구 목록 공개 토글 뮤테이션
- [x] 친구끊기
      상대방도 팔로우 끊게 만들기 선택 (상대방이 트위풀 사용중일 경우만 가능)
- [x] 친구동기화
      트위터 맞팔 사용자를 모두 친구로 추가, 이후 동기화를 통해 트위터 맞팔을 기준으로 친구목록 유지
- [ ] ~?친구동기화 기능을 비동기 말고 동기로 실행(반환 받을 값이 없고, 너무 오래 Pending됨)~
- [x] 트위터 주소 가져오기
      친구가 되면 트친소를 안해도 친구의 트위터로 연결 가능
- [x] 차단한/차단당한 친구요청에 대한 예외
- [x] 친구요청 취소 / 친구 거절

### TEST

- [ ] 친구가 아닌 상태에서 친구추가 => 친구요청 보내기
- [ ] 친구 요청을 보낸 상태에서 친구추가 => 친구요청 취소
- [ ] 친구 요청을 받은 상태에서 친구추가 => 친구요청 수락 => TWITTER API를 통해 맞팔로우
- [ ] 친구 요청을 받은 상태에서 친구삭제 => 친구요청 거절
- [ ] 친구요청을 보낸 상대가 트위터에서 내가/나를 블락한 상태 => 친구요청 불가
- [ ] 친구인 상태에서 친구삭제 => 친구관계 삭제 => TWITTER API를통해 언팔로우 => 선택을 통해 상대방도 나를 언팔로우
- [ ] 친구목록 공개 토글 => true라면 false => false라면 true
- [ ] 친구목록 공개한 상태 => true
- [ ] 친구목록 공개하지 않은 상태 AND 친구 아닌 상태 목록요청 => false
- [ ] 친구목록 공개하지 않은 상태 AND 친구인 상태 목록요청 => true
- [ ] 겹치는 친구 보기 (친구인 상태 AND 공개인 상태만 가능)
- [ ] 트위터 맞팔사용자를 트위풀 친구로 등록 (동기화)
      IF: 트위풀에서 친구이지만 트위터에서 맞팔이 아니라면 => 친구 삭제
      IF: 트위풀에서 친구가 아니지만 트위터에서 맞팔이라면 =>
      IF: 맞팔인 트위터 유저가 트위풀 User존재 => 해당 User와 친구(요청 과정없이 강제로 친구)
      IF: 맞팔인 트위터 유저가 트위풀 User없음 => 해당 TwitterID로 새로운 User 생성 후 친구(요청 과정없이 강제로 친구)
      (해당 작업을 스케쥴테스크로 만들 수 있으면 24시간에 한 번씩 실행)

## 프로필

### TODO

- [x] 자기소개 추가하기(이메일은 추후 일반회원 기능생기면, 필드만 만들어둠)
- [x] 링크 추가/수정/삭제하기

## 취향

### TODO

- [x] 취향 이름 필터링 (특수문자 및 띄어쓰기 모두 제거)
- [x] 취향을 직접 좋아요 or 싫어요 하기
      존재하지 않는 취향은 자동으로 생성하기
      기능은 토글식으로 작동
- [x] 좋아요 한 취향을 싫어요할 경우 (반대의 경우도)
- [x] 싫어요 공개 토글 (좋아요는 무조건 공개)
- [x] 내가 해당 취향을 좋아요했는지 싫어요했는지 표시
- [x] 취향 검색기능 및 pagination

## 한줄평

### TODO

- [x] 한줄평 작성하기
      대상은 취향이 되거나 프로필이 될 수 있음
      취향/사용자에 대해 한 사람당 하나의 한줄평만 달 수 있음 (중복불가)
- [x] 한줄평 수정하기
- [x] 한줄평 삭제하기

## 트친소

### TODO

- [x] 트친소 진행여부 확인하기 !! (공개여부 && 만료여부)
- [x] 트친소 공개하기
- [x] 트친소를 공개하면 친구요청이 가능해짐
- [x] 트친소를 공개하면 프로필을 통해 트위터 연결이 가능해짐
- [x] 트친소에 적용할 취향 선택 (좋아요/싫어요 각각 최대 10개)
- [x] 트친소 종료하면 모든 친구요청 삭제
- [x] 트친소 추천 알고리즘..

## 트위터API

### TODO

- [ ] 트친소 트윗하기
- [ ] 리뷰 트윗하기

## 알림기능

### TODO

- [ ] 친구요청시 알림 전송
- [ ] 친구수락시 알림 전송

## 알려진 버그

- [ ] new Date로 DB에 날짜 추가시 시간대가 안맞음

## 확인할 것

- [ ] 친구동기화 API 요청 초과시 에러처리가 잘 되는지 확인하기
      트위터 API에 1회 요청 한도량 이상으로 요청할 경우 나눠서 요청한 뒤 합치는 로직이 정상작동 하는지 확인하기
- [ ] 친구 동기화시

## 코드 작성 시 참고

- twitter api에서 error 처리를 thorw new Error(err)가 아니라 throw err로 던져줘야함
- twitter passport 모듈에서 을 직접 추가해줘야함 (
  options.userAuthorizationURL = options.userAuthorizationURL || 'https://api.twitter.com/oauth/authenticate?force_login=true';
  )
- ORM으로 관계설정 한 경우, GQL과 자동연계가 안되므로 직접 필드리졸버를 통해 쿼리 작성해야 함

## 해결하기 어려운 문제

1. repository에 대한 mock설정이 작동하지 않는다. 진짜 하루종일 할 수 있는 거 다해봤는데도 안된다. 에러 메세지는 `Nest can't resolve dependencies of the UserRepository (?). Please make sure that the argument Connection at index [0] is available in the TypeOrmModule context.`라고 나오는데, UserRepository에 대한 의존성 관련인데, UserRepository자체가 데코레이터로 주입되는 의존성 모듈이고, 그걸 대신해서

```ts
{
  provide: getRepositoryToken(User),
  useValue: {},
},
```

를 providers에 추가해 봤지만 여전히 같은 에러가 나온다.
**해결함!**
문제 원인: mock모듈을 생성할 때 imports를 통해 다른 모듈들을 불러왔는데, 그 모듈 내에서 의존성 문제가 있었던 것으로 예상. (정확히는 AuthModule에서 UserRepository를 다시 불러오는데 그 의존성쪽에 문제가 있었던 것으로 예상된다.) 테스트는 사실 API와 관련없이 해당 로직이 정상작동 하는지에 대한 검사가 더 중요하기 때문에, 이렇게 모든 변화가능한 사항들(DB, API)을 mock으로 제한하여 통제가능한 폐쇄된 테스트환경을 구축하는 게 가장 중요하다는 사실을 배웠다..
